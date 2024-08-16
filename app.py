from flask import render_template, request

from utils import *
from views import views as views_app

app = Flask(__name__, template_folder='templates')
app.debug = True
app.register_blueprint(views_app, url_prefix='/')


@app.route('/')
def index_page():
    return render_template('index.html')


@app.route('/signup')
def signup_page():
    return render_template('signup.html')


@app.route('/customer_homepage')
def customer_homepage():
    account = request.args.get('c-account')
    return render_template('customer_homepage.html', account=account)


@app.route('/customer_profile')
def customer_profile_page():
    return render_template('customer_profile.html')


@app.route('/my_collects')
def my_collects_page():
    return render_template('my_collects.html')


@app.route('/my_messages')
def my_messages_page():
    return render_template('my_messages.html')


@app.route('/my_orders')
def my_orders_page():
    return render_template('my_orders.html')


@app.route('/my_comments')
def my_comments_page():
    return render_template('my_comments.html')


@app.route('/my_reservations')
def my_reservations_page():
    return render_template('my_reservations.html')


@app.route('/search_results')
def search_results_page():
    return render_template('search_results.html')


@app.route('/merchant_detailed')
def merchant_detailed_page():
    return render_template('merchant_detailed.html')


@app.route('/menu')
def menu_page():
    return render_template('menu.html')


@app.route('/dish_detailed')
def dish_detailed_page():
    return render_template('dish_detailed.html')


@app.route('/comment_on_order')
def comment_on_order_page():
    return render_template('comment_on_order.html')


@app.route('/administrator_homepage')
def administrator_homepage():
    return render_template('administrator_homepage.html')


@app.route('/add_customer')
def add_customer_page():
    return render_template('add_customer.html')


@app.route('/customer_list')
def customer_list_page():
    return render_template('customer_list.html')


@app.route('/add_merchant')
def add_merchant_page():
    return render_template('add_merchant.html')


@app.route('/merchant_list')
def merchant_list_page():
    return render_template('merchant_list.html')


@app.route('/merchant_homepage')
def merchant_homepage():
    account = request.args.get('m-account')
    return render_template('merchant_homepage.html', account=account)


@app.route('/merchant_profile')
def merchant_profile_page():
    return render_template('merchant_profile.html')


@app.route('/merchant_reservations')
def merchant_reservations_page():
    return render_template('merchant_reservations.html')


@app.route('/edit_customer_information')
def edit_customer_information_page():
    return render_template('edit_customer_information.html')


@app.route('/edit_merchant_information')
def edit_merchant_information_page():
    return render_template('edit_merchant_information.html')


@app.route('/merchant_orders')
def merchant_orders_page():
    return render_template('merchant_orders.html')


@app.route('/administrator_merchant_detailed')
def administrator_merchant_detailed_page():
    account = request.args.get('m-account')
    return render_template('administrator_merchant_detailed.html', account=account)


@app.route('/administrator_dish_detailed')
def administrator_dish_detailed_page():
    return render_template('administrator_dish_detailed.html')


@app.route('/manage_menu')
def merchant_menu_page():
    account = request.args.get('m-account')
    return render_template('manage_menu.html', account=account)


@app.route('/merchant_comments')
def merchant_comments_page():
    return render_template('merchant_comments.html')


@app.route('/edit_dish')
def edit_dish_page():
    return render_template('edit_dish.html')


@app.route('/merchant_data')
def merchant_data_page():
    return render_template('merchant_data.html')


if __name__ == '__main__':
    app.run()
