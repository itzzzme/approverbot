# Slack Approval Bot

A Node.js-based Slack bot built with the [@slack/bolt](https://www.npmjs.com/package/@slack/bolt) framework for handling approval requests within Slack. This bot allows users to submit requests for approval, which can then be approved or rejected by selected approvers.

## Features
- **Slash Command (`/approval-test`)**: Opens a modal for users to submit an approval request.
- **Dynamic Approver Selection**: Users can select an approver from the Slack user list.
- **Approval Details**: Users provide details about their request.
- **Approval/Reject Notifications**: Approvers can take action on requests, and requesters are notified of the outcome.

## Installation
1. **Clone the repository**:

   ```bash
   git clone https://github.com/itzzzme/approverbot.git
   cd approverbot
   ```

2. **Install dependencies**:
    ```bash
   npm install
    ```
3. **Create a `.env` file in the root directory and add your Slack credentials**:
    ```bash
    SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
    SLACK_SIGNING_SECRET=your-slack-signing-secret
    SLACK_APP_TOKEN=xapp-your-slack-app-token
    PORT=<port_number>
    ```
4. **Start the application**:
    ```bash
    npm start #or npm run dev
    ```

## Usage
- `Slash Command`: Type `/approval-test` in any Slack channel or direct message.
- `Submit Modal`: Fill in the approver's name and details for the approval.
- `Approval/Reject Actions`: Approvers receive the request and can approve or reject it using buttons.


## File Structure
 ```bash
├── .env                # Environment variables
├── index.js            # Main bot application code
├── package.json        # dependencies
└── README.md           # Project documentation
```
### Main Components
- Slash Command (`/approval-test`):
    - Opens a modal where users can select an approver and provide details.
- Modal Submission Handling:
    - Extracts input and sends an approval request to the chosen approver.
- Button Actions:
    - `approve_action`: Approves the request and notifies the requester.
    - `reject_action`: Rejects the request and notifies the requester.

## Architectural Diagram
<img
        src="./diagram.png"
        width="full"
        height="300"
      />

## Dependencies
- [@slack/bolt](https://www.npmjs.com/package/@slack/bolt)
- [dotenv](https://www.npmjs.com/package/dotenv)

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.