from flask import Flask, request, jsonify, session
from  flask_sqlalchemy import SQLAlchemy
from passlib.hash import bcrypt
import secrets
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS

#initialize the flask app
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'vhwiufhwoiery289570138rweighskdj'
app.config["JWT_SECRET_KEY"] = 'adfhoifhoewiy78934750948roijgfkl'
app.config['JWT_TOKEN_LOCATION'] = ['headers']

jwt = JWTManager(app)




#database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Mpodedra@localhost/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#initialize SQLAlchemy object
db = SQLAlchemy(app)

#Defining tables (models)

# User Model
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Method to set password hash using Passlib (bcrypt)
    def set_password(self, password):
        self.password = bcrypt.hash(password)

    # Method to check password hash
    def check_password(self, password):
        return bcrypt.verify(password, self.password)

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
     analytics_id = db.Column(db.Integer, primary_key=True)
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
        # Create JWT token
        access_token = create_access_token(identity=user.user_id)
        return jsonify({"message": "Login successful", "access_token": access_token}), 200

    return jsonify({"message": "Invalid credentials"}), 401
    
#Route to get all users
@app.route('/get_user', methods=['GET'])
@jwt_required()
def get_users():
    user_id = get_jwt_identity
    list_of_users = User.query.all()
    result = []
    for u in list_of_users:
        result.append({
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name
        })
    return jsonify(result)

#Get Category names
@app.route('/get_category', methods=['GET'])
def get_category():
    category_names = Category.query.all()
    result = []
    for item in category_names:
        result.append({
            'category_id': item.category_id,
            'name': item.name
        })
    return jsonify(result)

# Route to get all food items
@app.route('/get_food', methods=['GET'])
@jwt_required()
def get_food_items():
    user_id = get_jwt_identity()
    food_items = FoodItem.query.all()
    result = []
    for item in food_items:
        result.append({
            'food_id': item.food_id,
            'user_id': item.user_id,
            'name': item.name,
            'quantity': item.quantity,
            'category_id': item.category_id,
            'purchase_date': item.purchase_date,
            'expiration_date': item.expiration_date,
            'storage_method': item.storage_method,
            'added_at': item.added_at
        })
    return jsonify(result)

#Route to add a food item
@app.route('/food_items', methods=['POST'])
@jwt_required()
def add_food_items():

    user_id = get_jwt_identity()

    if 'user_id' not in session:
        return jsonify({"error": "User not logged in"}), 401

    data = request.get_json()

    # Ensure required fields are provided
    required_fields = ["name", "quantity", "category_id", "purchase_date", "expiration_date", "storage_method"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    new_food_item = FoodItem(
        user_id=session['user_id'],
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

#Route to update a food item
@app.route('/update_food_item/<int:food_id>', methods=['PUT'])
@jwt_required()
def update_food_item(food_id):
    food_item = FoodItem.query.get(food_id)

    if not food_item:
        return jsonify({'error': 'Food item not found'}), 404

    data = request.get_json()

    # Update only if key exists in request data
    if 'name' in data:
        food_item.name = data['name']
    if 'quantity' in data:
        food_item.quantity = data['quantity']
    if 'category_id' in data:
        food_item.category_id = data['category_id']
    if 'purchase_date' in data:
        food_item.purchase_date = data['purchase_date']
    if 'expiration_date' in data:
        food_item.expiration_date = data['expiration_date']
    if 'storage_method' in data:
        food_item.storage_method = data['storage_method']

    db.session.commit()  # Save changes to DB

    return jsonify({'message': 'Food item updated successfully'}), 200

@app.route('/delete_food_items/<int:food_id>', methods=['DELETE'])
@jwt_required()
def delete_food_item(food_id):
    food_item = FoodItem.query.get(food_id)

    if food_item:
        # Delete the food item from the database
        db.session.delete(food_item)
        db.session.commit()
        return jsonify({'message': 'Food item deleted successfully'}), 200
    
    return jsonify({'message': 'Food item not found'}), 404


# 4️⃣ Run the App
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
