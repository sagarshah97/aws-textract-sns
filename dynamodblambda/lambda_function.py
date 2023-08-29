import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('expense-log')


def is_table_empty():
    response = table.scan(Limit=1)
    return len(response['Items']) == 0


def lambda_handler(event, context):
    user_id = event['user_id']
    submitted_date = event['submitted_date']
    amount = event['amount']
    expense_file_url = event['expense_file_url']
    image_file_url = event['image_file_url']

    try:
        if is_table_empty():

            new_item = form_item_data(
                user_id, submitted_date, amount, expense_file_url, image_file_url)
            table.put_item(Item=new_item)
        else:
            response = table.get_item(Key={'pk': 'user#' + user_id})
            if 'Item' in response:
                existing_item = response['Item']
                existing_item['expenses'].append({
                    'submitted_date': submitted_date,
                    'amount': amount,
                    'expense_file_url': expense_file_url,
                    'image_file_url': image_file_url
                })
                table.put_item(Item=existing_item)
            else:
                new_item = form_item_data(
                    user_id, submitted_date, amount, expense_file_url, image_file_url)
                table.put_item(Item=new_item)

        return {
            'statusCode': 200,
            'body': json.dumps('Expense entry added successfully')
        }
    except Exception as e:
        print('Error adding expense entry: {}'.format(str(e)))
        return {
            'statusCode': 500,
            'body': json.dumps('Error adding expense entry: {}'.format(str(e)))
        }


def form_item_data(user_id, submitted_date, amount, expense_file_url, image_file_url):
    return {
        'pk': 'user#' + user_id,
        'user_id': user_id,
        'expenses': [
            {
                'submitted_date': submitted_date,
                'amount': amount,
                'expense_file_url': expense_file_url,
                'image_file_url': image_file_url
            }
        ]
    }
