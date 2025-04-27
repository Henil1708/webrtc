export default function DeviceSelector({
  devices,
  selectedDevice,
  onSelect,
  position = "bottom",
}) {
  if (devices.length === 0) {
    return (
      <div className={`device-selector ${position}`}>
        <div className="device-selector-item">No devices found</div>
      </div>
    );
  }

  return (
    <div className={`device-selector ${position}`}>
      {devices.map((device) => (
        <div
          key={device.deviceId}
          className={`device-selector-item ${
            selectedDevice === device.deviceId ? "selected" : ""
          }`}
          onClick={() => onSelect(device.deviceId)}
        >
          {device.label || `Device ${device.deviceId.substring(0, 5)}...`}
        </div>
      ))}
    </div>
  );
}
