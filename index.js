// Importing the Slack Bolt framework and dotenv to load environment variables
const { App } = require("@slack/bolt");
require("dotenv").config(); // Loads environment variables from a .env file

// Initialize the Slack App instance
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,  // The bot token for authenticating API requests
  signingSecret: process.env.SLACK_SIGNING_SECRET,  // Secret to verify requests come from Slack
  appToken: process.env.SLACK_APP_TOKEN,  // App-level token for interacting with the Slack API
  socketMode: true,  // Enables Socket Mode for receiving events
});

// Handling the '/approval-test' slash command
slackApp.command("/approval-test", async ({ ack, body, client }) => {
  try {
    // Acknowledge the slash command so Slack knows it's received
    await ack();

    // Open a modal for the user to fill in approval details
    await client.views.open({
      trigger_id: body.trigger_id,  // Trigger ID received from Slack to open the modal
      view: {
        type: "modal",  // Modal type for interactive window
        callback_id: "request-approval-modal",  // Identifier for this view
        title: {
          type: "plain_text",
          text: "Submit for Approval",  // Modal title
        },
        submit: {
          type: "plain_text",
          text: "Submit",  // Submit button text
        },
        close: {
          type: "plain_text",
          text: "Cancel",  // Cancel button text
        },
        blocks: [
          {
            type: "input",
            block_id: "approver_selection",  // Block ID for the approver selection input
            element: {
              type: "users_select",  // User select dropdown
              placeholder: {
                type: "plain_text",
                text: "Choose an approver",  // Placeholder text
              },
              action_id: "selected_approver",  // Action ID for the selection
            },
            label: {
              type: "plain_text",
              text: "Approver",  // Label for the user select input
            },
          },
          {
            type: "input",
            block_id: "details_block",  // Block ID for the approval details input
            element: {
              type: "plain_text_input",  // Plain text input field
              action_id: "details_input",  // Action ID for the input field
              multiline: true,  // Allow multiple lines of text
            },
            label: {
              type: "plain_text",
              text: "Details for Approval",  // Label for the details input field
            },
          },
        ],
      },
    });
  } catch (err) {
    console.error(err);  // Log any errors to the console
  }
});

// Handling the modal submission (after user clicks "Submit")
slackApp.view("request-approval-modal", async ({ ack, body, client, view }) => {
  try {
    // Retrieve the approver's user ID and the details from the submitted modal
    const approverId = view.state.values.approver_selection.selected_approver.selected_user;
    const requestDetails = view.state.values.details_block.details_input.value;

    // Get the requester's user ID from the body of the submission
    const requesterId = body.user.id;

    // Create a message text with the approval request details
    const messageText = `Approval requested:\n*${requestDetails}*`;
    const requesterInfo = `*Requested By:*\n<@${requesterId}>`;  // Mention the requester
    const approverInfo = `*Approver:*\n<@${approverId}>`;  // Mention the approver

    // Send a message to the approver with the approval request
    await client.chat.postMessage({
      channel: approverId,  // Send the message to the approver
      text: `You have a new approval request:\n${requestDetails}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: messageText,  // Display the approval details
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: requesterInfo,  // Display requester information
            },
            {
              type: "mrkdwn",
              text: "*Status:*\nPending",  // Set the approval status as "Pending"
            },
            {
              type: "mrkdwn",
              text: approverInfo,  // Display approver information
            },
            {
              type: "mrkdwn",
              text: "*Visibility:*\nAll",  // Visibility set to "All"
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",  // Approve button
              text: {
                type: "plain_text",
                emoji: true,
                text: "Approve",  // Text on the approve button
              },
              style: "primary",  // Button style for approval
              value: `approve_${requesterId}`,  // Value sent when the button is clicked
              action_id: "approve_action",  // Action ID to trigger on click
            },
            {
              type: "button",  // Reject button
              text: {
                type: "plain_text",
                emoji: true,
                text: "Reject",  // Text on the reject button
              },
              style: "danger",  // Button style for rejection
              value: `reject_${requesterId}`,  // Value sent when the button is clicked
              action_id: "reject_action",  // Action ID to trigger on click
            },
          ],
        },
      ],
    });

    // Notify the requester that their request has been sent to the approver
    await client.chat.postMessage({
      channel: requesterId,
      text: `Your request has been sent to <@${approverId}>\n*Description*: ${requestDetails}`,
    });

    // Acknowledge the view submission so that Slack knows the action was handled
    await ack();
  } catch (err) {
    console.error(err);  // Log any errors to the console
  }
});

// Handling the approval button click
slackApp.action("approve_action", async ({ ack, body, client, action }) => {
  try {
    // Extract the requester ID from the action value (e.g., 'approve_userID')
    const requesterId = action.value.split("_")[1];
    const approverId = body.user.id;

    // Notify the requester that their request has been approved
    await client.chat.postMessage({
      channel: requesterId,
      text: `Your request was approved by <@${approverId}>.`,
    });

    // Notify the approver that their action was successful
    await client.chat.postMessage({
      channel: approverId,
      text: `You approved the request from <@${requesterId}>.`,
    });

    // Acknowledge the button action so that Slack knows it's been handled
    await ack();
  } catch (err) {
    console.error(err);  // Log any errors to the console
  }
});

// Handling the rejection button click
slackApp.action("reject_action", async ({ ack, body, client, action }) => {
  try {
    // Extract the requester ID from the action value (e.g., 'reject_userID')
    const requesterId = action.value.split("_")[1];
    const approverId = body.user.id;

    // Notify the requester that their request has been rejected
    await client.chat.postMessage({
      channel: requesterId,
      text: `Your request was rejected by <@${approverId}>.`,
    });

    // Notify the approver that their action was successful
    await client.chat.postMessage({
      channel: approverId,
      text: `You rejected the request from <@${requesterId}>.`,
    });

    // Acknowledge the button action so that Slack knows it's been handled
    await ack();
  } catch (err) {
    console.error(err);  // Log any errors to the console
  }
});

// Start the Slack app and listen for events on the specified port
(async () => {
  await slackApp.start(process.env.PORT || 8000);  // Start the app on the configured port or 8000 by default
  console.log(`Slack bot is active on port ${process.env.PORT || 8000}`);  // Log a message indicating the app is running
})();
