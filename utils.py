import random
import string
from collections import defaultdict
from datetime import timedelta

import bcrypt

from Database import *


def customer_register(account, name, password, gender, age, hometown, major):
    this_session = Session()
    salt = bcrypt.gensalt()
    password = password.encode('utf-8')
    password = bcrypt.hashpw(password, salt)
    customer = Customer(account=account, name=name, password=password, gender=gender, age=age,
                        hometown=hometown, major=major)
    this_session.add(customer)
    this_session.commit()


def merchant_register(account, name, password, introduction, pictures, address):
    this_session = Session()
    salt = bcrypt.gensalt()
    password = password.encode('utf-8')
    password = bcrypt.hashpw(password, salt)
    merchant = Merchant(account=account, name=name, password=password, introduction=introduction,
                        pictures=pictures, address=address)
    this_session.add(merchant)
    this_session.commit()


def administrator_register(account, password):
    this_session = Session()
    salt = bcrypt.gensalt()
    password = password.encode('utf-8')
    password = bcrypt.hashpw(password, salt)
    administrator = Administrator(account=account, password=password)
    this_session.add(administrator)
    this_session.commit()


def login(account, password, kind):
    this_session = Session()
    if kind == 'customer':
        user = this_session.get(Customer, account)
    elif kind == 'merchant':
        user = this_session.get(Merchant, account)
    elif kind == 'administrator':
        user = this_session.get(Administrator, account)
    else:
        raise Exception('Kind must be "customer" or "merchant" or "administrator"')
    if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return True
    else:
        return False


def generate_random_filename(length=10, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(length))


def get_most_interested_customers(dish_id):
    this_session = Session()
    customers_dish_count = {}
    dish = this_session.get(Dish, dish_id)
    most_volume = 0
    most_interested_customer = None
    for order in dish.orders:
        if order.customer[0].account not in customers_dish_count.keys():
            customers_dish_count[order.customer[0].account] = 1
        else:
            customers_dish_count[order.customer[0].account] += 1
        if customers_dish_count[order.customer[0].account] > most_volume:
            most_volume = customers_dish_count[order.customer[0].account]
            most_interested_customer = order.customer[0].account
    return most_interested_customer


def get_recent_volume(dish_id):
    this_session = Session()
    dish = this_session.get(Dish, dish_id)
    now = datetime.now()
    one_week_ago = now - timedelta(days=7)
    results = this_session.query(Order).filter(
        Order.time >= one_week_ago,
        Order.dishes.contains(dish)
    ).order_by(Order.time).all()
    return len(results)


def get_customer_activity(customer_account):
    this_session = Session()
    customer = this_session.get(Customer, customer_account)
    now = datetime.now()
    one_week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    three_weeks_ago = now - timedelta(days=21)
    four_weeks_ago = now - timedelta(days=28)
    orders_in_one_week = this_session.query(Order).filter(
        Order.customer == customer, Order.time > one_week_ago).order_by(Order.time).all()
    orders_in_two_week = this_session.query(Order).filter(
        Order.customer == customer, Order.time > two_weeks_ago, Order.time < one_week_ago).order_by(Order.time).all()
    orders_in_three_week = this_session.query(Order).filter(
        Order.customer == customer, Order.time > three_weeks_ago, Order.time < two_weeks_ago).order_by(Order.time).all()
    orders_in_four_week = this_session.query(Order).filter(
        Order.customer == customer, Order.time > four_weeks_ago, Order.time < three_weeks_ago).order_by(Order.time).all()
    return {'one_week_volume': len(orders_in_one_week),
            'two_weeks_volume': len(orders_in_two_week),
            'three_weeks_volume': len(orders_in_three_week),
            'four_weeks_volume': len(orders_in_four_week)}


def get_regular_customers(merchant_account):
    this_session = Session()
    merchant = this_session.get(Merchant, merchant_account)
    consumption_frequency = defaultdict(int)
    for order in merchant.orders:
        consumption_frequency[order.customer[0].account] += 1
    regular_customers = [key for key, value in consumption_frequency.items() if value > 5]
    return regular_customers


def get_purchase_distribution(merchant_account, customer_account):
    this_session = Session()
    merchant = this_session.get(Merchant, merchant_account)
    customer = this_session.get(Customer, customer_account)
    orders = this_session.query(Order).join(Order.customer).join(Order.merchant).filter(
        customer.account == Customer.account, merchant.account == Merchant.account).all()
    distribution = defaultdict(int)
    for order in orders:
        for dish in order.dishes:
            distribution[dish.name] += 1
    return distribution


def get_order_distribution():
    this_session = Session()
    male_customers = this_session.query(Customer).filter(Customer.gender == 'Male').all()
    female_customers = this_session.query(Customer).filter(Customer.gender == 'Female').all()
    male_order_distribution = defaultdict(int)
    female_order_distribution = defaultdict(int)
    for customer in male_customers:
        for order in customer.orders:
            male_order_distribution[order.merchant[0].account] += 1
    for customer in female_customers:
        for order in customer.orders:
            female_order_distribution[order.merchant[0].account] += 1
    this_session.close()
    return male_order_distribution, female_order_distribution


def get_comment_habits():
    this_session = Session()
    male_habit = 0
    male_comment_cnt = 0
    female_habit = 0
    female_comment_cnt = 0
    comments = this_session.query(Comment).all()
    for comment in comments:
        if comment.sender[0].gender == 'male':
            male_habit += comment.stars
            male_comment_cnt += 1
        if comment.sender[0].gender == 'female':
            female_habit += comment.stars
            female_comment_cnt += 1
    male_comment_habit = male_habit / male_comment_cnt if male_comment_cnt > 0 else 0
    female_comment_habit = female_habit / female_comment_cnt if female_comment_cnt > 0 else 0
    this_session.close()

    return {
        'male_comment_habit': male_comment_habit,
        'male_comment_cnt': male_comment_cnt,
        'female_comment_habit': female_comment_habit,
        'female_comment_cnt': female_comment_cnt
    }

def get_daily_amount(merchant_account):
    this_session = Session()
    now = datetime.now()
    yesterday = now - timedelta(days=1)
    orders = this_session.query(Order).join(Order.merchant).filter(
        Merchant.account == merchant_account, Order.time > yesterday).all()
    amount = 0
    for order in orders:
        amount += order.total_price
    return {
        'time': now,
        'amount': amount,
        'order_number': len(orders)
    }