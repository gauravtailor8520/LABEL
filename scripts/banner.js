// Clear terminal screen to suppress npm script echo output
process.stdout.write('\x1Bc');

const orange = "\x1b[38;2;252;118;3m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";
const green = "\x1b[32m";
const dim = "\x1b[2m";

const banner = `

${orange}${bold}                       
                               ██╗      █████╗ ██████╗ ███████╗██╗
                               ██║     ██╔══██╗██╔══██╗██╔════╝██║
                               ██║     ███████║██████╔╝█████╗  ██║
                               ██║     ██╔══██║██╔══██╗██╔══╝  ██║
                               ███████╗██║  ██║██████╔╝███████╗███████╗
                               ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝${reset}

                                ${bold}LABEL • AI DATA LABELING PLATFORM${reset}
================================================================================

Version        : v1.0.0
Environment    : Development
Workspace      : LABEL
Author         : Gaurav Tailor
Repository     : https://github.com/gauravtailor8520/LABEL
Status         : ${green}[✓] System Ready${reset}

================================================================================
                       ${orange}${bold}LABEL is ready for annotation.${reset}
================================================================================
`;

console.log(banner);
