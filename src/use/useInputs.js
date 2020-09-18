export default function useInputs() {
  // function inputName creates the Input names column in the Input Dialog. 
  //  The user can override these default names by changing the input label
  function inputName(arg) {
    if(arg==undefined) return;
    if((arg[0]=='h') && (arg.length == 2)) return "HDMI " + arg[1];
    if((arg[0]=='a') && (arg.length == 2)) return "Analog " + arg[1];
    if((arg[0]=='s') && (arg.length == 6)) return "COAX " + arg[5];
    if((arg[0]=='o') && (arg.length == 8)) return "Optical " + arg[7];

    switch(arg) {
      case 'tv': 
        return 'TV';
      case 'roon': 
        return 'Roon';
      case 'aes':
        return "AES/EBU";
      case 'b':
        return 'Bluetooth';
      case 'fm':
        return 'FM';
      case 'usb':
        return 'USB Audio';
      default:
        return arg.toUpperCase();
    }
  }

  return { inputName };
}
