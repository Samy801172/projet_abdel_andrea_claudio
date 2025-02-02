// Notifcation au client de divers infos

import 'package:flutter/scheduler.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
  FlutterLocalNotificationsPlugin();

  Future<void> showNotification(String title, String body) async {
    var android = AndroidNotificationDetails(
      'channel_id',
      'channel_name',
      'channel_description',
      importance: Importance.high,
      priority: Priority.high,
    );
    var platform = NotificationDetails(android: android);

    await flutterLocalNotificationsPlugin.show(
      0,
      title,
      body,
      platform,
      payload: 'OrderPayload',
    );
  }
}
