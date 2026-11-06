type Notification = {
  orderId: string;
  recipient: string;
};

type Notifier = {
  send(message: Notification): Promise<void>;
};

export function confirmation(notifier: Notifier) {
  return (message: Notification) => notifier.send(message);
}

// At the composition root:
// confirmation(emailNotifier)
// confirmation(smsNotifier)
