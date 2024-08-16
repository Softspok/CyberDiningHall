from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy import create_engine, ForeignKeyConstraint
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import sessionmaker

app = Flask(__name__, template_folder='templates')
HOSTNAME = "localhost"
PORT = 3306
USERNAME = "super_user"
PASSWORD = "Genshin Impact, activate!"
DATABASE = "CyberDiningHall"
app.config['SQLALCHEMY_DATABASE_URI'] = (f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:"
                                         f"{PORT}/{DATABASE}?charset=utf8")

db = SQLAlchemy(app)
engine = create_engine(f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:"
                       f"{PORT}/{DATABASE}?charset=utf8")
Session = sessionmaker(bind=engine)

CollectDish = db.Table(
    'CollectDish',
    db.Column('customer_account', db.String(40), db.ForeignKey('customer.account')),
    db.Column('dish_id', db.Integer, db.ForeignKey('dish.dish_id')),
)

CollectMerchant = db.Table(
    'CollectMerchant',
    db.Column('merchant_account', db.String(40), db.ForeignKey('merchant.account')),
    db.Column('customer_account', db.String(40), db.ForeignKey('customer.account')),
)

IngredientIn = db.Table(
    'IngredientIn',
    db.Column('ingredient_id', db.Integer, db.ForeignKey('ingredient.ingredient_id')),
    db.Column('dish_id', db.Integer, db.ForeignKey('dish.dish_id')),
)

NutritionIn = db.Table(
    'NutritionIn',
    db.Column('nutrition_id', db.Integer, db.ForeignKey('nutrition.nutrition_id')),
    db.Column('dish_id', db.Integer, db.ForeignKey('dish.dish_id')),
)

AllergenIn = db.Table(
    'AllergenIn',
    db.Column('allergen_id', db.Integer, db.ForeignKey('allergen.allergen_id')),
    db.Column('dish_id', db.Integer, db.ForeignKey('dish.dish_id')),
)

CommentOn = db.Table(
    'CommentOn',
    db.Column('comment_id', db.Integer, db.ForeignKey('comment.comment_id')),
    db.Column('customer_account', db.String(40), db.ForeignKey('customer.account')),
    db.Column('order_id', db.Integer, db.ForeignKey('order.order_id')),
)

DishInOrder = db.Table(
    'DishInOrder',
    db.Column('dish_id', db.Integer, db.ForeignKey('dish.dish_id')),
    db.Column('order_id', db.Integer, db.ForeignKey('order.order_id')),
    db.Column('number', db.Integer),
)

MakeOrder = db.Table(
    'MakeOrder',
    db.Column('order_id', db.Integer, db.ForeignKey('order.order_id')),
    db.Column('customer_account', db.String(40), db.ForeignKey('customer.account')),
)

Offer = db.Table(
    'Offer',
    db.Column('merchant_account', db.String(40), db.ForeignKey('merchant.account')),
    db.Column('order_id', db.Integer, db.ForeignKey('order.order_id')),
)


SendReceive = db.Table(
    'SendReceive',
    db.Column('merchant_account', db.String(40), db.ForeignKey('merchant.account')),
    db.Column('customer_account', db.String(40), db.ForeignKey('customer.account')),
    db.Column('message_id', db.Integer, db.ForeignKey('message.message_id')),
)

About = db.Table(
    'About',
    db.Column('message_id', db.Integer, db.ForeignKey('message.message_id')),
    db.Column('order_id', db.Integer, db.ForeignKey('order.order_id')),
)

Menu = db.Table(
    'Menu',
    db.Column('dish_id', db.Integer, db.ForeignKey('dish.dish_id')),
    db.Column('merchant_account', db.String(40), db.ForeignKey('merchant.account')),
)


class Customer(db.Model):
    __tablename__ = 'customer'
    account = db.Column(db.String(40), primary_key=True)
    password = db.Column(db.String(60))
    name = db.Column(db.String(40))
    gender = db.Column(db.String(5), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    hometown = db.Column(db.String(40), nullable=True)
    major = db.Column(db.String(40), nullable=True)
    collect_merchants = db.relationship('Merchant', secondary=CollectMerchant)
    collect_dishes = db.relationship('Dish', secondary=CollectDish, back_populates='collector')
    orders = db.relationship('Order', secondary=MakeOrder, back_populates='customer')
    reservations = db.relationship('Reserve', back_populates='customer')
    messages = db.relationship(
        'Message', secondary=SendReceive, back_populates='receiver', overlaps='messages, receiver')
    comments = db.relationship(
        'Comment',
        secondary=CommentOn,
        back_populates='sender',
        primaryjoin=(CommentOn.c.customer_account == account), )


class Merchant(db.Model):
    __tablename__ = 'merchant'
    account = db.Column(db.String(40), primary_key=True)
    password = db.Column(db.String(60))
    name = db.Column(db.String(40))
    address = db.Column(db.String(40), nullable=True)
    pictures = db.Column(db.String(500), nullable=True)
    introduction = db.Column(db.String(1000), nullable=True)
    collectedCnt = db.Column(db.Integer, default=0)
    dishes = db.relationship('Dish', secondary=Menu, back_populates='merchant')
    messages = db.relationship(
        'Message', secondary=SendReceive, back_populates='sender', overlaps="messages, sender")
    reservations = db.relationship('Reserve', back_populates='merchant')
    orders = db.relationship('Order', secondary=Offer, back_populates='merchant')

    @hybrid_property
    def stars(self):
        total_Cnt = sum(dish.commentCnt for dish in self.dishes)
        if total_Cnt == 0:
            return 0
        stars = sum(dish.stars for dish in self.dishes) / total_Cnt
        return stars


class Order(db.Model):
    __tablename__ = 'order'
    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.Integer)
    total_price = db.Column(db.Numeric(10, 2))
    merchant = db.relationship('Merchant', secondary=Offer, back_populates='orders')
    dishes = db.relationship('Dish', secondary=DishInOrder, back_populates='orders')
    customer = db.relationship('Customer', secondary=MakeOrder, back_populates='orders')
    messages = db.relationship('Message', secondary=About, back_populates='order')
    comments = db.relationship(
        'Comment',
        secondary=CommentOn,
        back_populates='receiver',
        primaryjoin=(CommentOn.c.order_id == order_id),
        viewonly=True)


class Dish(db.Model):
    __tablename__ = 'dish'
    merchant_account = db.Column(db.String(40), db.ForeignKey('merchant.account'))
    dish_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(40))
    price = db.Column(db.Numeric(10, 2))
    history = db.Column(db.JSON, nullable=True)
    type = db.Column(db.String(40), nullable=True)
    description = db.Column(db.String(1000), nullable=True)
    pictures = db.Column(db.String(500), nullable=True)
    stars = db.Column(db.Numeric(10, 2), default=0)
    volume = db.Column(db.Integer, default=0)
    offline_volume = db.Column(db.Integer, default=0)
    collectedCnt = db.Column(db.Integer, default=0)
    commentCnt = db.Column(db.Integer, default=0)
    orders = db.relationship('Order', secondary=DishInOrder, back_populates='dishes')
    collector = db.relationship('Customer', secondary=CollectDish, back_populates='collect_dishes')
    merchant = db.relationship('Merchant', secondary=Menu, back_populates='dishes')
    nutrition = db.relationship("Nutrition", secondary=NutritionIn, back_populates='dishes_contain')
    allergens = db.relationship("Allergen", secondary=AllergenIn, back_populates='dishes_contain')
    ingredients = db.relationship("Ingredient", secondary=IngredientIn, back_populates='dishes_contain')


class Comment(db.Model):
    __tablename__ = 'comment'
    comment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    stars = db.Column(db.Integer, default=5)
    text = db.Column(db.String(1000))
    pictures = db.Column(db.String(500), nullable=True)
    time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    sender = db.relationship(
        'Customer',
        secondary=CommentOn,
        back_populates='comments',
        primaryjoin=CommentOn.c.comment_id == comment_id,
        overlaps='comments, sender')
    receiver = db.relationship(
        'Order',
        secondary=CommentOn,
        back_populates='comments',
        primaryjoin=CommentOn.c.comment_id == comment_id,
        overlaps='comments, receiver')


class Message(db.Model):
    __tablename__ = 'message'
    message_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.String(1000))
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    sender = db.relationship(
        'Merchant', secondary=SendReceive, back_populates='messages', overlaps='messages, sender')
    receiver = db.relationship(
        'Customer', secondary=SendReceive, back_populates='messages', overlaps='messages, receiver')
    order = db.relationship('Order', secondary=About, back_populates='messages')


class Ingredient(db.Model):
    __tablename__ = 'ingredient'
    ingredient_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(40))
    description = db.Column(db.String(1000), nullable=True)
    dishes_contain = db.relationship('Dish', secondary=IngredientIn, back_populates='ingredients')


class Nutrition(db.Model):
    __tablename__ = 'nutrition'
    nutrition_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(40))
    description = db.Column(db.String(1000), nullable=True)
    dishes_contain = db.relationship('Dish', secondary=NutritionIn, back_populates='nutrition')


class Allergen(db.Model):
    __tablename__ = 'allergen'
    allergen_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(40))
    description = db.Column(db.String(1000), nullable=True)
    dishes_contain = db.relationship('Dish', secondary=AllergenIn, back_populates='allergens')


class Reserve(db.Model):
    __tablename__ = 'reserve'
    reserve_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    merchant_account = db.Column(db.String(40), db.ForeignKey('merchant.account'))
    customer_account = db.Column(db.String(40), db.ForeignKey('customer.account'))
    merchant = db.relationship('Merchant', back_populates='reservations')
    customer = db.relationship('Customer', back_populates='reservations')


class Administrator(db.Model):
    __tablename__ = 'administrator'
    account = db.Column(db.String(40), primary_key=True)
    password = db.Column(db.String(60))


with app.app_context():
    db.create_all()
