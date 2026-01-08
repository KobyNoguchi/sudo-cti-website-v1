export interface Technique {
  id: string;
  name: string;
}

export interface Tactic {
  name: string;
  techniques: Technique[];
}

export const mitreICSMatrixData: Tactic[] = [
  {
    name: "Initial Access",
    techniques: [
      { id: "T0817", name: "Drive-by Compromise" },
      { id: "T0819", name: "Exploit Public-Facing Application" },
      { id: "T0866", name: "Exploitation of Remote Services" },
      { id: "T0822", name: "External Remote Services" },
      { id: "T0883", name: "Internet Accessible Device" },
      { id: "T0886", name: "Remote Services" },
      { id: "T0847", name: "Replication Through Removable Media" },
      { id: "T0848", name: "Rogue Master" },
      { id: "T0865", name: "Spearphishing Attachment" },
      { id: "T0862", name: "Supply Chain Compromise" },
      { id: "T0864", name: "Transient Cyber Asset" },
      { id: "T0860", name: "Wireless Compromise" },
    ],
  },
  {
    name: "Execution",
    techniques: [
      { id: "T0895", name: "Autorun Image" },
      { id: "T0858", name: "Change Operating Mode" },
      { id: "T0807", name: "Command-Line Interface" },
      { id: "T0871", name: "Execution through API" },
      { id: "T0823", name: "Graphical User Interface" },
      { id: "T0874", name: "Hooking" },
      { id: "T0821", name: "Modify Controller Tasking" },
      { id: "T0834", name: "Native API" },
      { id: "T0853", name: "Scripting" },
      { id: "T0863", name: "User Execution" },
    ],
  },
  {
    name: "Persistence",
    techniques: [
      { id: "T0891", name: "Hardcoded Credentials" },
      { id: "T0889", name: "Modify Program" },
      { id: "T0839", name: "Module Firmware" },
      { id: "T0873", name: "Project File Infection" },
      { id: "T0857", name: "System Firmware" },
      { id: "T0859", name: "Valid Accounts" },
    ],
  },
  {
    name: "Privilege Escalation",
    techniques: [
      { id: "T0890", name: "Exploitation for Privilege Escalation" },
      { id: "T0874", name: "Hooking" },
    ],
  },
  {
    name: "Evasion",
    techniques: [
      { id: "T0858", name: "Change Operating Mode" },
      { id: "T0820", name: "Exploitation for Evasion" },
      { id: "T0872", name: "Indicator Removal on Host" },
      { id: "T0849", name: "Masquerading" },
      { id: "T0851", name: "Rootkit" },
      { id: "T0856", name: "Spoof Reporting Message" },
      { id: "T0894", name: "System Binary Proxy Execution" },
    ],
  },
  {
    name: "Discovery",
    techniques: [
      { id: "T0840", name: "Network Connection Enumeration" },
      { id: "T0842", name: "Network Sniffing" },
      { id: "T0846", name: "Remote System Discovery" },
      { id: "T0888", name: "Remote System Information Discovery" },
      { id: "T0887", name: "Wireless Sniffing" },
    ],
  },
  {
    name: "Lateral Movement",
    techniques: [
      { id: "T0812", name: "Default Credentials" },
      { id: "T0866", name: "Exploitation of Remote Services" },
      { id: "T0891", name: "Hardcoded Credentials" },
      { id: "T0867", name: "Lateral Tool Transfer" },
      { id: "T0843", name: "Program Download" },
      { id: "T0886", name: "Remote Services" },
      { id: "T0859", name: "Valid Accounts" },
    ],
  },
  {
    name: "Collection",
    techniques: [
      { id: "T0830", name: "Adversary-in-the-Middle" },
      { id: "T0802", name: "Automated Collection" },
      { id: "T0811", name: "Data from Information Repositories" },
      { id: "T0893", name: "Data from Local System" },
      { id: "T0868", name: "Detect Operating Mode" },
      { id: "T0877", name: "I/O Image" },
      { id: "T0801", name: "Monitor Process State" },
      { id: "T0861", name: "Point & Tag Identification" },
      { id: "T0845", name: "Program Upload" },
      { id: "T0852", name: "Screen Capture" },
      { id: "T0887", name: "Wireless Sniffing" },
    ],
  },
  {
    name: "C2",
    techniques: [
      { id: "T0885", name: "Commonly Used Port" },
      { id: "T0884", name: "Connection Proxy" },
      { id: "T0869", name: "Standard Application Layer Protocol" },
    ],
  },
  {
    name: "Inhibit Response Function",
    techniques: [
      { id: "T0800", name: "Activate Firmware Update Mode" },
      { id: "T0878", name: "Alarm Suppression" },
      { id: "T0803", name: "Block Command Message" },
      { id: "T0804", name: "Block Reporting Message" },
      { id: "T0805", name: "Block Serial COM" },
      { id: "T0892", name: "Change Credential" },
      { id: "T0809", name: "Data Destruction" },
      { id: "T0814", name: "Denial of Service" },
      { id: "T0816", name: "Device Restart/Shutdown" },
      { id: "T0835", name: "Manipulate I/O Image" },
      { id: "T0838", name: "Modify Alarm Settings" },
      { id: "T0851", name: "Rootkit" },
      { id: "T0881", name: "Service Stop" },
      { id: "T0857", name: "System Firmware" },
    ],
  },
  {
    name: "Impair Process Control",
    techniques: [
      { id: "T0806", name: "Brute Force I/O" },
      { id: "T0836", name: "Modify Parameter" },
      { id: "T0839", name: "Module Firmware" },
      { id: "T0856", name: "Spoof Reporting Message" },
      { id: "T0855", name: "Unauthorized Command Message" },
    ],
  },
  {
    name: "Impact",
    techniques: [
      { id: "T0879", name: "Damage to Property" },
      { id: "T0813", name: "Denial of Control" },
      { id: "T0815", name: "Denial of View" },
      { id: "T0826", name: "Loss of Availability" },
      { id: "T0827", name: "Loss of Control" },
      { id: "T0828", name: "Loss of Productivity and Revenue" },
      { id: "T0837", name: "Loss of Protection" },
      { id: "T0880", name: "Loss of Safety" },
      { id: "T0829", name: "Loss of View" },
      { id: "T0831", name: "Manipulation of Control" },
      { id: "T0832", name: "Manipulation of View" },
      { id: "T0882", name: "Theft of Operational Information" },
    ],
  },
];


