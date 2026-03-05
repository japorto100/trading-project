# RuView (π) – WiFi DensePose

> **Stand:** März 2026
> **Quelle:** [ruvnet/RuView](https://github.com/ruvnet/RuView)
> **Relevanz:** Smart Home, IoT, Privacy-preserving Sensing – nicht Trading.

## Kurzbeschreibung

WiFi DensePose wandelt handelsübliche WiFi-Signale in Echtzeit-Pose-Erkennung, Vitalzeichen-Monitoring und Präsenzerkennung um – ohne Kamera, ohne Wearables.

## Funktionsweise

- **CSI (Channel State Information):** Pro-Subcarrier-Amplitude und -Phase statt nur RSSI
- **Fresnel-Zonen:** Atembewegung moduliert die Phase → Atemfrequenz
- **BVP (Body Velocity Profile):** Doppler-Effekt → Bewegungsmuster
- **Multistatic:** Mehrere ESP32-Nodes → bessere Pose-Schätzung

## Hardware

- ESP32-S3 Mesh (3–6 Nodes, ~$54)
- Intel 5300 / Atheros AR9580 (Research NIC)
- Jedes WiFi (nur RSSI: grobe Präsenz)

## Use Cases

Smart Home, Healthcare, Retail, Security – durch Wände, bei Dunkelheit, datenschutzfreundlich.
