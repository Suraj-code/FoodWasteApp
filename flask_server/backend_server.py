from flask import Flask, request, jsonify, session
from  flask_sqlalchemy import SQLAlchemy
from passlib.hash import bcrypt
import secrets

#initialize the flask app
app = Flask(__name__)

secret_key = secrets.token_hex(16)
print(secret_key)

app.config['SECRET_KEY'] = secret_key

#database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Mpodedra@localhost/FoodWasteDb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#initialize SQLAlchemy object
db = SQLAlchemy(app)

#Defining tables (models)

# User Model
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Method to set password hash using Passlib (bcrypt)
    def set_password(self, password):
        self.password_hash = bcrypt.hash(password)

    # Method to check password hash
    def check_password(self, password):
        return bcrypt.verify(password, self.password_hash)

# Food Item Model
class FoodItem(db.Model):
    __tablename__ = 'food_items'
    food_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))
    purchase_date = db.Column(db.Date)
    expiration_date = db.Column(db.Date)
    storage_method = db.Column(db.String(50))
    added_at = db.Column(db.DateTime, default=db.func.current_timestamp())

#Expiration Date Model
class ExpirationDate(db.Model):
    __tablename__ = 'expiration_dates'
    expiration_id = db.Column(db.Integer, primary_key=True)
    food_id = db.Column(db.Integer, db.ForeignKey('food_items.food_id'))
    predicted_expiration_date = db.Column(db.Date)
    reminder_date = db.Column(db.Date)

#Waste logs Model
class WasteLogs(db.Model):
     __tablename__ = 'waste_logs'
     waste_id = db.Column(db.Integer, primary_key=True)
     food_id = db.Column(db.Integer, db.ForeignKey('food_items.food_id'))
     user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
     quantity = db.Column(db.Integer)
     waste_date = db.Column(db.Date)
     reason = db.Column(db.String(255))

#Analytics Model
class Analytics(db.Model):
     __tablename__ = 'analytics'
     user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
     total_food_added = db.Column(db.Integer)
     total_food_wasted = db.Column(db.Integer)
     total_food_saved = db.Column(db.Integer)

# Category Model
class Category(db.Model):
    __tablename__ = 'categories'
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

# Initialize Database (Create Tables if they don't exist)
with app.app_context():
    db.create_all()

# 3️⃣ API Routes

# Route for User Sign-up
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Check if user already exists
    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({"message": "User already exists"}), 400
    
    # Create a new user
    new_user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

#Route for User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        # Set session to keep user logged in (example of keeping user logged in)
        session['user_id'] = user.user_id
        session['email'] = user.email
        
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# Route to get all food items
@app.route('/food-items', methods=['GET'])
def get_food_items():
    food_items = FoodItem.query.all()
    result = []
    for item in food_items:
        result.append({
            'food_id': item.food_id,
            'user_id': item.user_id,
            'name': item.name,
            'quantity': item.quantity,
            'purchase_date': item.purchase_date,
            'expiration_date': item.expiration_date,
            'storage_method': item.storage_method,
            'added_at': item.added_at
        })
    return jsonify(result)

#Route to add a food item
@app.route('/food_items', methods=['POST'])
def add_food_items():
    data = request.get_json()
    new_food_item = FoodItem(
        user_id=data['user_id'],
        name=data['name'],
        quantity=data['quantity'],
        category_id=data['category_id'],
        purchase_date=data['purchase_date'],
        expiration_date=data['expiration_date'],
        storage_method=data['storage_method']
    )
    db.session.add(new_food_item)
    db.session.commit()
    return jsonify({'message': 'Food item added successfully'}), 201


# 4️⃣ Run the App
if __name__ == '__main__':
    app.run(debug=True)