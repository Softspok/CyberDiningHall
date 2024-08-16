import json
import os

from flask import *
from sqlalchemy import func, update, and_, select

from utils import *

views = Blueprint('views', __name__)


@views.route('/signup_customer_handler', methods=['POST'])
def signup_customer_handler():
    this_session = Session()
    data = request.json
    try:
        customer_register(data['account'], data['name'], data['password'], data['gender'], data['age'],
                          data['hometown'], data['major'])
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 409
    finally:
        this_session.close()
    return jsonify({"account": data['account']}), 201


@views.route('/signup_merchant_handler', methods=['POST'])
def signup_merchant_handler():
    this_session = Session()
    data = request.json
    try:
        merchant_register(data['account'], data['name'], data['password'], data['introduction'], None,
                          data['address'])
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 409
    finally:
        this_session.close()
    return jsonify({"account": data['account']}), 201


@views.route('/login_handler', methods=['POST'])
def login_handler():
    data = request.json
    this_session = Session()
    try:
        if login(data['account'], data['password'], data['type']):
            return jsonify({"account": data['account']}), 200
        else:
            return jsonify({"error": "密码错误！请重新输入"}), 401
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 404
    finally:
        this_session.close()


@views.route('/search_merchant_brief', methods=['POST'])
def search_merchant_brief_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        substring = data['text']
        results = this_session.query(Merchant).filter(Merchant.name.like(f'%{substring}%')).all()
        for result in results:
            output.append({
                'account': result.account,
                'name': result.name,
                'introduction': result.introduction,
            })
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()
    return jsonify(output), 200


@views.route('/merchant_detailed', methods=['POST'])
def merchant_detailed_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        result = this_session.query(Merchant).get(data['account'])
        output.append({
            'account': result.account,
            'name': result.name,
            'introduction': result.introduction,
            'stars': result.stars,
            'pictures': result.pictures,
            'address': result.address,
            'collectedCnt': result.collectedCnt,
        })

    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    return jsonify(output), 200


@views.route('/random_merchant_brief', methods=['POST'])
def random_merchant_brief_handler():
    output = []
    this_session = Session()
    random_merchants = this_session.query(Merchant).order_by(func.random()).limit(5).all()
    for random_merchant in random_merchants:
        output.append({
            'account': random_merchant.account,
            'name': random_merchant.name,
            'introduction': random_merchant.introduction,
        })
    this_session.close()
    return jsonify(output), 200


@views.route('/customer_detailed', methods=['POST'])
def customer_detailed_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        customer = this_session.query(Customer).get(data['account'])
        output.append({
            'account': customer.account,
            'name': customer.name,
            'gender': customer.gender,
            'age': customer.age,
            'hometown': customer.hometown,
            'major': customer.major,
        })
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()
    return jsonify(output), 200


@views.route('/all_messages', methods=['POST'])
def all_messages_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        customer = this_session.query(Customer).get(data['account'])
        for message in customer.messages:
            output.append({
                'message_id': message.message_id,
                'text': message.text,
                'time': message.timestamp,
                'merchant_account': message.sender[0].account,
                'merchant_name': message.sender[0].name,
            })
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()
    return jsonify(output), 200


@views.route('/menu_handler', methods=['POST'])
def menu_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        merchant = this_session.query(Merchant).get(data['account'])
        for dish in merchant.dishes:
            output.append({
                'dish_id': dish.dish_id,
                'name': dish.name,
                'price': dish.price,
                'type': dish.type,
                'stars': dish.stars,
                'pictures': dish.pictures,
            })
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()
    return jsonify(output), 200


@views.route('/dish_detailed', methods=['POST'])
def dish_detailed_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        dish = this_session.query(Dish).filter_by(dish_id=data['dish_id'],
                                                  merchant_account=data['merchant_account']).first()
        nutritions = ''
        allergens = ''
        ingredients = ''
        for nutrition in dish.nutrition:
            nutritions += f'{nutrition.name} '
        for allergen in dish.allergens:
            allergens += f'{allergen.name} '
        for ingredient in dish.ingredients:
            ingredients += f'{ingredient.name} '
        output.append({
            'dish_id': dish.dish_id,
            'name': dish.name,
            'price': dish.price,
            'type': dish.type,
            'stars': dish.stars,
            'history': dish.history,
            'description': dish.description,
            'pictures': dish.pictures,
            'volume': dish.volume,
            'collectedCnt': dish.collectedCnt,
            'nutrition': nutritions,
            'allergens': allergens,
            'ingredients': ingredients,
        })
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()
    return jsonify(output), 200


@views.route('/new_order', methods=['POST'])
def new_order_handler():
    this_session = Session()
    try:
        data = request.json
        merchant = this_session.query(Merchant).get(data['merchant_account'])
        customer = this_session.query(Customer).get(data['customer_account'])
        total_price = 0
        order = Order(time=data['time'], status=0, total_price=total_price)
        this_session.add(order)
        this_session.commit()
        for dish_id in data['dish_counts'].keys():
            dish = this_session.query(Dish).filter_by(dish_id=dish_id,
                                                      merchant_account=data['merchant_account']).first()
            order.dishes.append(dish)
            dish.volume += 1
            this_session.commit()
            combined_condition = and_(DishInOrder.c.dish_id == dish.dish_id, DishInOrder.c.order_id == order.order_id)
            update_time = update(DishInOrder).where(combined_condition).values(
                {'number': (data['dish_counts'])[str(dish.dish_id)]})
            this_session.execute(update_time)
            total_price += dish.price * data['dish_counts'][str(dish.dish_id)]
            this_session.commit()
        order.total_price = total_price
        order.merchant.append(merchant)
        order.customer.append(customer)
        this_session.add(order)
        this_session.commit()
        return jsonify({"order_id": order.order_id}), 201
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/received_comments', methods=['POST'])
def received_comments_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        order = this_session.query(Order).filter_by(order_id=data['order_id']).first()
        for comment in order.comments:
            output.append({
                'comment_id': comment.comment_id,
                'stars': comment.stars,
                'text': comment.text,
                'time': comment.time,
                'name': comment.sender[0].name,
                'pictures': comment.pictures,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/dish_orders', methods=['POST'])
def dish_orders_handler():
    output = []
    data = request.json
    this_session = Session()
    try:
        dish = this_session.query(Dish).get(data['dish_id'])
        if not dish.orders:
            return jsonify({"error": "dish orders not found or dish in no order"}), 400
        for order in dish.orders:
            dish_in_order = []
            for dish in order.dishes:
                combined_condition = and_(DishInOrder.c.dish_id == dish.dish_id,
                                          DishInOrder.c.order_id == order.order_id)
                query = select(DishInOrder.c.number).where(combined_condition)
                number = this_session.execute(query).fetchone()[0]
                dish_in_order.append({
                    dish.name: number
                })
            output.append({
                'order_id': order.order_id,
                'time': order.time,
                'status': order.status,
                'dishes': dish_in_order,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/customer_all_comments', methods=['POST'])
def customer_all_comments_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        customer = this_session.query(Customer).get(data['account'])
        for comment in customer.comments:
            dishes = []
            for dish in comment.receiver[0].dishes:
                combined_condition = and_(DishInOrder.c.dish_id == dish.dish_id,
                                          DishInOrder.c.order_id == comment.receiver[0].order_id)
                query = select(DishInOrder.c.number).where(combined_condition)
                number = this_session.execute(query).fetchone()[0]
                dishes.append({
                    dish.name: number
                })
            output.append({
                'comment_id': comment.comment_id,
                'stars': comment.stars,
                'text': comment.text,
                'time': comment.time,
                'order_id': comment.receiver[0].order_id,
                'merchant_name': comment.receiver[0].merchant[0].name,
                'dishes': dishes,
                'pictures': comment.pictures,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/customer_all_orders', methods=['POST'])
def customer_all_orders_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        customer = this_session.query(Customer).get(data['account'])
        for order in customer.orders:
            dish_in_order = []
            for dish in order.dishes:
                combined_condition = and_(DishInOrder.c.dish_id == dish.dish_id,
                                          DishInOrder.c.order_id == order.order_id)
                query = select(DishInOrder.c.number).where(combined_condition)
                number = this_session.execute(query).fetchone()[0]
                dish_in_order.append({
                    dish.name: number
                })
            output.append({
                'order_id': order.order_id,
                'time': order.time,
                'total_price': order.total_price,
                'status': order.status,
                'merchant_account': order.merchant[0].account,
                'merchant_name': order.merchant[0].name,
                'dishes': dish_in_order,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/publish_comments', methods=['POST'])
def publish_comments_handler():
    this_session = Session()
    try:
        data = request.json
        sender = this_session.query(Customer).get(data['sender'])
        receiver = this_session.query(Order).get(data['order_id'])
        if data['stars'] is not None:
            comment = Comment(stars=data['stars'], text=data['text'], pictures=data['pictures'])
            comment.sender.append(sender)
            comment.receiver.append(receiver)
            for dish_id in data['dish_stars'].keys():
                dish = this_session.query(Dish).get(dish_id)
                dish.commentCnt += 1
                dish.stars = (dish.stars * (dish.commentCnt - 1) + data['dish_stars'].get(dish_id)) / dish.commentCnt

        elif data['stars'] is None:
            comment = Comment(text=data['text'], pictures=data['pictures'])
            comment.sender.append(sender)
            comment.receiver.append(receiver)
        else:
            return jsonify({"error $stars in /publish_comments!"}), 400
        receiver.status = 2
        this_session.add(comment)
        this_session.commit()
        return jsonify({"comment_id": comment.comment_id}), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/view_collect', methods=['POST'])
def view_collect_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        customer = this_session.query(Customer).get(data['account'])
        for merchant in customer.collect_merchants:
            output.append({
                'merchant_account': merchant.account,
                'merchant_name': merchant.name,
                'merchant_introduction': merchant.introduction,
                'dish_id': None,
                'dish_name': None
            })
        for dish in customer.collect_dishes:
            output.append({
                'dish_id': dish.dish_id,
                'dish_name': dish.name,
                'dish_introduction': dish.description,
                'merchant_account': dish.merchant_account,
                'merchant_name': dish.merchant[0].name,
                'offline_volume': dish.offline_volume,
                'recent_volume': get_recent_volume(dish.dish_id),
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/new_collect', methods=['POST'])
def new_collect_handler():
    data = request.json
    this_session = Session()
    try:
        customer = this_session.query(Customer).get(data['account'])
        if data['merchant'] is not None:
            merchant = this_session.query(Merchant).get(data['merchant'])
            customer.collect_merchants.append(merchant)
            merchant.collectedCnt += 1
            this_session.commit()
        else:
            dish = this_session.query(Dish).get(data['dish_id'])
            customer.collect_dishes.append(dish)
            dish.collectedCnt += 1
            this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/delete_collect', methods=['POST'])
def delete_collect_handler():
    data = request.json
    this_session = Session()
    try:
        customer = this_session.query(Customer).get(data['account'])
        if data['merchant'] is not None:
            merchant = this_session.query(Merchant).get(data['merchant'])
            customer.collect_merchants.remove(merchant)
            merchant.collectedCnt -= 1
            this_session.commit()
        else:
            dish = this_session.query(Dish).get(data['dish_id'])
            customer.collect_dishes.remove(dish)
            dish.collectedCnt -= 1
            this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/edit_customer_information', methods=['POST'])
def edit_customer_information_handler():
    data = request.json
    this_session = Session()
    try:
        customer = this_session.query(Customer).get(data['account'])
        if data['name'] is not None:
            customer.name = data['name']
        if data['password'] is not None:
            customer.password = data['password']
        if data['gender'] is not None:
            customer.gender = data['gender']
        if data['age'] is not None:
            customer.age = data['age']
        if data['hometown'] is not None:
            customer.hometown = data['hometown']
        if data['major'] is not None:
            customer.major = data['major']
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/edit_merchant_information', methods=['POST'])
def edit_merchant_information_handler():
    data = request.json
    this_session = Session()
    try:
        merchant = this_session.query(Merchant).get(data['account'])
        if data['name'] is not None:
            merchant.name = data['name']
        if data['password'] is not None:
            merchant.password = data['password']
        if data['introduction'] is not None:
            merchant.introduction = data['introduction']
        if data['address'] is not None:
            merchant.address = data['address']
        if data['pictures'] is not None:
            merchant.pictures = data['pictures']
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/new_dish', methods=['POST'])
def new_dish_handler():
    data = request.json
    this_session = Session()
    try:
        merchant = this_session.query(Merchant).get(data['merchant_account'])
        dish = Dish(merchant_account=data['merchant_account'],
                    name=data['dish_name'], price=data['dish_price'], description=data['dish_description'])
        merchant.dishes.append(dish)
        if data['pictures'] is not None:
            dish.pictures = data['pictures']
        if data['type'] is not None:
            dish.type = data['type']
        history = [{
            'time': str(datetime.now().replace(second=0, microsecond=0)),
            'price': dish.price,
        }]
        dish.history = history
        this_session.add(dish)
        this_session.commit()
        return jsonify({"dish_id": dish.dish_id}), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/delete_dish', methods=['POST'])
def delete_dish_handler():
    data = request.json
    this_session = Session()
    try:
        dish = this_session.query(Dish).get(data['dish_id'])
        this_session.delete(dish)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/edit_dish', methods=['POST'])
def edit_dish_handler():
    data = request.json
    this_session = Session()
    try:
        dish = this_session.query(Dish).get(data['dish_id'])
        if data['name'] is not None:
            dish.name = data['name']
        if data['type'] is not None:
            dish.type = data['type']
        if data['description'] is not None:
            dish.description = data['description']
        if data['pictures'] is not None:
            dish.pictures = data['pictures']
        if data['price'] is not None:
            history = json.load(dish.history)
            history.append({
                'time': str(datetime.now().replace(second=0, microsecond=0)),
                'price': data['price'],
            })
            dish.history = history
            dish.price = data['price']
        if data['ingredients'] is not None:
            for text in data['ingredients']:
                ingredient = this_session.query(Ingredient).filter_by(name=text).first()
                dish.ingredients.append(ingredient)
        if data['nutrition'] is not None:
            for text in data['nutrition']:
                nutrition = this_session.query(Nutrition).filter_by(name=text).first()
                dish.nutrition.append(nutrition)
        if data['allergens'] is not None:
            for text in data['allergens']:
                allergen = this_session.query(Allergen).filter_by(name=text).first()
                dish.allergens.append(allergen)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/delete_customer', methods=['POST'])
def delete_customer_handler():
    data = request.json
    this_session = Session()
    try:
        customer = this_session.query(Customer).get(data['account'])
        this_session.delete(customer)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/delete_merchant', methods=['POST'])
def delete_merchant_handler():
    data = request.json
    this_session = Session()
    try:
        merchant = this_session.query(Merchant).get(data['merchant'])
        this_session.delete(merchant)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/finish_order', methods=['POST'])
def finish_order_handler():
    data = request.json
    this_session = Session()
    try:
        order = this_session.query(Order).get(data['order_id'])
        order.status = 1
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/reserve', methods=['POST'])
def reserve_handler():
    data = request.json
    this_session = Session()
    try:
        reserve = Reserve(time=data['time'])
        merchant = this_session.query(Merchant).get(data['merchant_account'])
        customer = this_session.query(Customer).get(data['customer_account'])
        this_session.add(reserve)
        this_session.commit()
        customer.reservations.append(reserve)
        merchant.reservations.append(reserve)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/merchant_reserve', methods=['POST'])
def merchant_reserve_handler():
    data = request.json
    output = []
    this_session = Session()
    try:
        merchant = this_session.query(Merchant).get(data['account'])
        for reservation in merchant.reservations:
            output.append({
                "customer_account": reservation.customer.account,
                "customer_name": reservation.customer.name,
                "time": reservation.time,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/customer_reserve', methods=['POST'])
def customer_reserve_handler():
    data = request.json
    output = []
    this_session = Session()
    try:
        customer = this_session.query(Customer).get(data['account'])
        for reservation in customer.reservations:
            output.append({
                "merchant_account": reservation.merchant.account,
                "merchant_name": reservation.merchant.name,
                "time": reservation.time,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('new_message', methods=['POST'])
def new_message_handler():
    data = request.json
    this_session = Session()
    try:
        customer = this_session.query(Customer).get(data['customer_account'])
        merchant = this_session.query(Merchant).get(data['merchant_account'])
        message = Message(text=data['text'])
        this_session.add(message)
        this_session.commit()
        message.sender.append(merchant)
        message.receiver.append(customer)
        if data['order_id'] is not None:
            order = this_session.query(Order).get(data['order_id'])
            message.order.append(order)
        this_session.commit()
        return jsonify({"message_id": message.message_id}), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/view_allergen', methods=['POST'])
def view_allergens_handler():
    output = []
    this_session = Session()
    try:
        allergens = this_session.query(Allergen).all
        for allergen in allergens:
            output.append({
                "allergen_id": allergen.allergen_id,
                'name': allergen.name,
                'description': allergen.description,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/new_allergen', methods=['POST'])
def new_allergens_handler():
    data = request.json
    this_session = Session()
    try:
        dish = this_session.query(Dish).get(data['dish_id'])
        allergen = this_session.query(Allergen).get(data['allergen_id'])
        dish.allergens.append(allergen)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/view_nutrition', methods=['POST'])
def view_nutrition_handler():
    output = []
    this_session = Session()
    try:
        nutritions = this_session.query(Nutrition).all
        for nutrition in nutritions:
            output.append({
                "nutrition_id": nutrition.nutrition_id,
                'name': nutrition.name,
                'description': nutrition.description,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/new_nutrition', methods=['POST'])
def new_nutrition_handler():
    data = request.json
    this_session = Session()
    try:
        dish = this_session.query(Dish).get(data['dish_id'])
        nutrition = this_session.query(Nutrition).get(data['nutrition_id'])
        dish.nutritions.append(nutrition)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/view_ingredient', methods=['POST'])
def view_ingredients_handler():
    output = []
    this_session = Session()
    try:
        ingredients = this_session.query(Ingredient).all
        for ingredient in ingredients:
            output.append({
                "ingredient_id": ingredient.ingredient_id,
                'name': ingredient.name,
                'description': ingredient.description,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/new_ingredient', methods=['POST'])
def new_ingredients_handler():
    data = request.json
    this_session = Session()
    try:
        dish = this_session.query(Dish).get(data['dish_id'])
        ingredient = this_session.query(Ingredient).get(data['ingredient_id'])
        dish.ingredients.append(ingredient)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/search_dish', methods=['POST'])
def search_dish_handler():
    data = request.json
    output = []
    this_session = Session()
    try:
        merchant = this_session.query(Merchant).get(data['merchant_account'])
        substring = data['search']
        dishes = this_session.query(Dish).filter(Dish.name.like(f'%{substring}%')).all()
        for dish in dishes:
            if dish.merchant_account == merchant.account:
                output.append({
                    'dish_id': dish.dish_id,
                    'name': dish.name,
                    'price': dish.price,
                    'type': dish.type,
                    'stars': dish.stars,
                    'pictures': dish.pictures,
                })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/order_detailed', methods=['POST'])
def order_detailed_handler():
    data = request.json
    output = []
    this_session = Session()
    try:
        order = this_session.query(Order).get(data['order_id'])
        dish_in_order = []
        dish_ids = []
        for dish in order.dishes:
            combined_condition = and_(DishInOrder.c.dish_id == dish.dish_id,
                                      DishInOrder.c.order_id == order.order_id)
            query = select(DishInOrder.c.number).where(combined_condition)
            number = this_session.execute(query).fetchone()[0]
            dish_in_order.append({
                dish.name: number
            })
            dish_ids.append({
                dish.name: dish.dish_id
            })
        output.append({
            'order_id': order.order_id,
            'time': order.time,
            'total_price': order.total_price,
            'status': order.status,
            'merchant_name': order.merchant[0].name,
            'dishes': dish_in_order,
            'dish_ids': dish_ids,
        })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/cancel_reserve', methods=['POST'])
def cancel_reserve_handler():
    data = request.json
    this_session = Session()
    try:
        reserve = this_session.query(Reserve).get(data['reserve_id'])
        this_session.delete(reserve)
        this_session.commit()
        return '', 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/save_picture', methods=['POST'])
def save_picture_handler():
    this_session = Session()
    if not request.form:
        return '', 200
    folder = request.form['folder']
    output = ""
    files = request.files.getlist('files')
    upload_directory = 'static/image/' + folder
    if not files:
        return jsonify({"error": "No files"}), 400
    try:
        for file in files:
            if file:

                if not os.path.exists(upload_directory):
                    os.makedirs(upload_directory)

                # 指定文件名称
                random_filename = generate_random_filename() + '.' + file.filename.split('.')[-1]
                file.save(os.path.join(upload_directory, random_filename))
                output += '../' + upload_directory + '/' + random_filename + ' '
        return output, 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/merchant_all_orders', methods=['POST'])
def merchant_all_orders_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        merchant = this_session.query(Merchant).get(data['account'])
        for order in merchant.orders:
            dish_in_order = []
            for dish in order.dishes:
                combined_condition = and_(DishInOrder.c.dish_id == dish.dish_id,
                                          DishInOrder.c.order_id == order.order_id)
                query = select(DishInOrder.c.number).where(combined_condition)
                number = this_session.execute(query).fetchone()[0]
                dish_in_order.append({
                    dish.name: number
                })
            output.append({
                'order_id': order.order_id,
                'time': order.time,
                'total_price': order.total_price,
                'status': order.status,
                'customer_id': order.customer[0].account,
                'dishes': dish_in_order,
            })
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()
    return jsonify(output), 200

@views.route('/get_all_merchant', methods=['POST'])
def get_all_merchant_handler():
    output = []
    this_session = Session()
    try:
        merchants = this_session.query(Merchant).all()
        for merchant in merchants:
            output.append({
                'account': merchant.account,
                'name': merchant.name,
                'introduction': merchant.introduction,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/get_all_customer', methods=['POST'])
def get_all_customer_handler():
    output = []
    this_session = Session()
    try:
        customers = this_session.query(Customer).all()
        for customer in customers:
            output.append({
                'account': customer.account,
                'name': customer.name,
                'age': customer.age,
                'gender': customer.gender,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('/get_allergens_nutrition_ingredients', methods=['GET'])
def get_allergens_nutrition_ingredients_handler():
    output = {}
    output_allergens = []
    output_nutrition = []
    output_ingredients = []
    this_session = Session()
    try:
        allergens = this_session.query(Allergen).all()
        nutritions = this_session.query(Nutrition).all()
        ingredients = this_session.query(Ingredient).all()
        for allergen in allergens:
            output_allergens.append(allergen.name)
        for nutrition in nutritions:
            output_nutrition.append(nutrition.name)
        for ingredient in ingredients:
            output_ingredients.append(ingredient.name)
        output = {
            'allergens': output_allergens,
            'nutrition': output_nutrition,
            'ingredients': output_ingredients
        }
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('analyze_dish_data', methods=['POST'])
def analyze_dish_data():
    output = []
    this_session = Session()
    data = request.json
    try:
        merchant = this_session.query(Merchant).get(data['account'])
        for dish in merchant.dishes:
            most_interested_customer = get_most_interested_customers(dish.dish_id)
            output.append({
                'dish_id': dish.dish_id,
                'dish_name': dish.name,
                'stars': dish.stars,
                'volume': dish.volume,
                'most_interested_customer': most_interested_customer
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('analyze_dish_volume', methods=['POST'])
def analyze_dish_volume():
    this_session = Session()
    data = request.json
    try:
        dish = this_session.query(Dish).get(data['dish_id'])
        output = ({
            'dish_id': dish.dish_id,
            'offline_volume': dish.offline_volume,
            'recent_volume': get_recent_volume(dish.dish_id),
        })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('get_regular_customer_purchase_distribution', methods=['POST'])
def get_regular_customer_purchase_distribution_handler():
    data = request.json
    output = []
    this_session = Session()
    try:
        regular_customers = get_regular_customers(data['merchant_account'])
        for customer_account in regular_customers:
            customer = this_session.query(Customer).get(customer_account)
            output.append({
                'customer_name': customer.name,
                'distribution': get_purchase_distribution(data['merchant_account'], customer_account),
            })
        return jsonify(output), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@views.route('get_customer_activity', methods=['POST'])
def get_customer_activity_handler():
    output = []
    this_session = Session()
    try:
        data = request.json
        customer = this_session.query(Customer).get(data['account'])
        for order in customer.orders:
            output.append({
                'order_id': order.order_id,
                'time': order.time,
            })
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()


@views.route('analyze_customer_feature', methods=['POST'])
def analyze_customer_feature():
    output = [{}, {}, {}]
    output[0], output[1] = get_order_distribution()
    output[2] = get_comment_habits()
    return jsonify(output), 200

@views.route('get_daily_amount', methods=['POST'])
def get_daily_amount_handler():
    this_session = Session()
    data = request.json
    try:
        output = get_daily_amount(data['account'])
        return jsonify(output), 200
    except Exception as e:
        this_session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        this_session.close()