# Easy Claim - Secure and Effortless Expense Reimbursement powered by AWS

This project developed using AWS and ReactJS, designed to revolutionize and simplify the expense reimbursement process. It empowers users to effortlessly submit claims by extracting text from receipts, enabling real-time notifications to administrators, and providing a user-friendly interface for enhanced efficiency.

## Objectives:

The project's primary objectives are:

- To automate and streamline the expense reimbursement process for users, administrators, and accounting teams.
- To provide a secure and user-centric platform for submitting claims, reducing manual effort and errors.
- To leverage AWS services and ReactJS to create a seamless and responsive experience for users and administrators alike.

## Goals

Easy Claim aims to achieve the following goals:

- Automate text extraction from bill images, facilitating 95% reduction in manual data entry efforts.
- Enable real-time notifications to administrators through SNS, leading to a 50% decrease in processing time.
- Offer a user-friendly ReactJS frontend for easy navigation and 40% faster claim submissions.
- Ensure data security with API Gateway and API Key for secure access control.
- Attain 100% automation in AWS Cloud infrastructure setup via CloudFormation templates, eliminating manual configuration.

## Built with:

- AWS Services: DynamoDB, Lambda functions, S3, API Gateway, SNS, Textract
- Frontend: ReactJS

## Pre-requisites:

- Download and install [Node.js](https://nodejs.org/en/download)
- Clone this repository.
  - Backend:
    - Log into your AWS Account.
    - In the given `cloudformation/cloud-formation.yml` update the IAM Role as per your requirement. (Make sure your role has access to given resources.)
    - Create the stack using this template.
    - From the `Outputs` section, copy the `EC2PublicIp` and open it in the new tab of the browser.
  - Frontend:
    - Type the following commands: `npm install` and `npm start`

## Sources used:

- Images and icons:
  - Image by <a href="https://www.freepik.com/free-vector/money-lending-abstract-concept_12084848.htm#query=expense%20claim&position=29&from_view=search&track=ais">vectorjuice </a>on Freepik
