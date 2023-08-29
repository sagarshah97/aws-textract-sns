import base64
import boto3
import json
import os
import datetime
from textractprettyprinter.t_pretty_print_expense import get_string, Textract_Expense_Pretty_Print, Pretty_Print_Table_Format


def lambda_handler(event, context):
    topic_arn = os.environ.get('SNS_TOPICARN')
    bucket = 'expense-reimbursement'
    textract = boto3.client(service_name='textract')
    s3 = boto3.client('s3')
    sns = boto3.client('sns')

    key = event['key']
    image = event['image']
    email = event['email']
    userId = event['userId']

    image_binary = decode_base64(image)

    folder_path = 'submitted-images/'
    object_key = folder_path + key
    s3.put_object(Body=image_binary, Bucket=bucket, Key=object_key)

    try:
        response = textract.analyze_expense(Document={'Bytes': image_binary})

        pretty_printed_string = get_string(textract_json=response, output_type=[
            Textract_Expense_Pretty_Print.SUMMARY, Textract_Expense_Pretty_Print.LINEITEMGROUPS], table_format=Pretty_Print_Table_Format.fancy_grid)

        text_data_bytes = bytes(pretty_printed_string, 'utf-8')

        final_folder_path = 'extracted-analysis/'
        final_object_key = final_folder_path + key.rsplit('.', 1)[0] + '.txt'
        s3.put_object(Body=text_data_bytes, Bucket=bucket,
                      Key=final_object_key)

        subject = "New expense claim"
        message = f"A new expense claim has been submitted by employee.\nEmployee Id: {userId}\nEmployee email: {email}."
        sns.publish(
            TopicArn=topic_arn,
            Message=message,
            Subject=subject,
        )

        res = {}

        try:
            response_data = extract_details(json.dumps(response))
            total_amount = extract_amount(
                json.dumps(response_data), "TOTAL")
            if write_to_dynamodb(userId, total_amount, bucket, object_key, final_object_key):
                res = {
                    'statusCode': 200,
                    'body': json.dumps({
                        'emailSent': True,
                        'logCreated': True,
                        'totalAmount': total_amount,
                        'responseData': response_data,
                        'extractedDetails': pretty_printed_string
                    })
                }
            else:
                res = {
                    'statusCode': 200,
                    'body': json.dumps({
                        'emailSent': True,
                        'logCreated': False,
                        'totalAmount': '',
                        'responseData': response_data,
                        'extractedDetails': pretty_printed_string
                    })
                }
        except Exception as e_raise:
            print(e_raise)
            res = {
                'statusCode': 200,
                'body': json.dumps({
                    'emailSent': True,
                    'logCreated': True,
                    'totalAmount': '',
                    'responseData': '',
                    'extractedDetails': pretty_printed_string
                })
            }

        return res

    except Exception as e_raise:
        print(e_raise)
        raise e_raise


def write_to_dynamodb(user_id, amount, bucket, image_key, file_key):
    payload = {
        'user_id': user_id,
        'submitted_date': datetime.datetime.now().strftime('%Y-%m-%d'),
        'amount': amount,
        'expense_file_url': f'https://{bucket}.s3.amazonaws.com/{file_key}',
        'image_file_url': f'https://{bucket}.s3.amazonaws.com/{image_key}',
    }

    target_lambda_name = 'expenseLogPython'
    region = 'us-east-1'
    client = boto3.client('lambda', region_name=region)
    response = client.invoke(
        FunctionName=target_lambda_name,
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )

    response_data = json.loads(
        response['Payload'].read().decode('utf-8'))

    if response_data['statusCode'] == 200:
        return True
    return False


def extract_details(json_data):
    json_data = json.loads(json_data)
    extracted_summary = []
    extract_expense_data = []
    final_data = []
    response_data = {}

    expense_documents = json_data['ExpenseDocuments']
    for expense_document in expense_documents:
        summary_fields = expense_document['SummaryFields']
        for summary_field in summary_fields:
            field_type = summary_field['Type']['Text']
            value_detection = summary_field['ValueDetection']['Text']
            json_obj = {
                'key': field_type,
                'value': value_detection
            }
            extracted_summary.append(json_obj)

        line_items = expense_document['LineItemGroups'][0]['LineItems']
        for line_item in line_items:
            line_item_expense_fields = line_item['LineItemExpenseFields']
            for line_item_expense_field in line_item_expense_fields:
                field_type = line_item_expense_field['Type']['Text']
                value_detection = line_item_expense_field['ValueDetection']['Text']
                if "ITEM" in field_type or "PRICE" in field_type:
                    json_obj = {
                        'key': field_type,
                        'value': value_detection
                    }
                    extract_expense_data.append(json_obj)

    for i in range(0, len(extract_expense_data), 2):
        item = extract_expense_data[i]["value"]
        price = extract_expense_data[i + 1]["value"]
        final_data.append({"key": item, "value": price})

    response_data = {
        'summary': extracted_summary,
        'expense': extract_expense_data
    }

    return (response_data)


def extract_amount(data, key):
    data = json.loads(data)
    for item in data["summary"]:
        if item["key"] == key:
            return item["value"]
    return None


def decode_base64(base64_string):
    if base64_string.startswith('data:'):
        base64_string = base64_string.split(',')[1]

    return base64.b64decode(base64_string)
