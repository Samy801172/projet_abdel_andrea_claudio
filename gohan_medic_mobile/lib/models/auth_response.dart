class AuthResponse {
  final String accessToken;
  final int clientId;

  AuthResponse({
    required this.accessToken,
    required this.clientId,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['token'] ?? json['access_token'],
      clientId: json['clientId'] ?? -1,
    );
  }
} 