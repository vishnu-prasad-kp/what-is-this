class ScanResult {
  final String id;
  final String imageUrl;
  final String name;
  final String confidence;
  final String description;
  final List<String> uses;
  final String importantInfo;
  final String safetyNote;
  final String? createdAt;

  ScanResult({
    required this.id,
    required this.imageUrl,
    required this.name,
    required this.confidence,
    required this.description,
    required this.uses,
    required this.importantInfo,
    required this.safetyNote,
    this.createdAt,
  });

  factory ScanResult.fromJson(Map<String, dynamic> json) {
    String parsedConfidence = 'High Match';
    final rawConf = json['confidence'];
    if (rawConf is String && rawConf.isNotEmpty) {
      parsedConfidence = '${rawConf[0].toUpperCase()}${rawConf.substring(1)} Confidence';
    } else if (rawConf is num) {
      parsedConfidence = '${(rawConf * 100).toInt()}% Match';
    }

    return ScanResult(
      id: json['id']?.toString() ?? '',
      imageUrl: json['image_url']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Identified Object',
      confidence: parsedConfidence,
      description: json['description']?.toString() ?? '',
      uses: (json['uses'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      importantInfo: json['important_info']?.toString() ?? '',
      safetyNote: json['safety_note']?.toString() ?? '',
      createdAt: json['created_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'image_url': imageUrl,
      'name': name,
      'confidence': confidence,
      'description': description,
      'uses': uses,
      'important_info': importantInfo,
      'safety_note': safetyNote,
      'created_at': createdAt,
    };
  }
}
