import { DEPARTMENTS, isValidDepartment } from '@/types/recruitment';
import type { TerminalEntryType } from '@/types/recruitment';
import { recruitmentApi } from '@/services/recruitmentApi';

export interface CommandHandlerResult {
  output: string[];
  type: TerminalEntryType;
  newDepartment?: string | null;
  shouldClear?: boolean;
}

export interface CommandHandler {
  (args: string[], currentDepartment: string | null): Promise<CommandHandlerResult>;
}

const formatHelp = (): string => {
  return `CYSCOM TERMINAL COMMANDS
────────────────────────────────────────────

/help
    Display this help menu.

/ls
    List recruited members in the current department.

/cd <department>
    Change the active department.

/pwd
    Display the current department.

/clear
    Clear terminal output.

/whoami
    Display current access identity.

/departments
    Display available departments.

/status
    Display system and recruitment database status.

/about
    Display information about CYSCOM.

/banner
    Display the CYSCOM terminal banner.

/exit
    Return to the initial terminal state.

Examples:

    /cd Design
    /ls

Available departments:

    ${DEPARTMENTS.join('\n    ')}
`;
};

const formatBanner = (): string => {
  return `
 ██████╗██╗   ██╗███████╗ ██████╗ ██████╗ ███╗   ███╗
██╔════╝╚██╗ ██╔╝██╔════╝██╔════╝██╔═══██╗████╗ ████║
██║      ╚████╔╝ ███████╗██║     ██║   ██║██╔████╔██║
██║       ╚██╔╝  ╚════██║██║     ██║   ██║██║╚██╔╝██║
╚██████╗   ██║   ███████║╚██████╗╚██████╔╝██║ ╚═╝ ██║
 ╚═════╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝

CYSCOM RECRUITMENT SYSTEM
SECURE TERMINAL v1.0
`;
};

const handleHelp: CommandHandler = async () => ({
  output: [formatHelp()],
  type: 'system',
});

const handleCd: CommandHandler = async (args, currentDepartment) => {
  const department = args[0];

  if (!department) {
    return {
      output: ['Usage: /cd <department>', '', 'Available departments:', ...DEPARTMENTS],
      type: 'output',
    };
  }

  // Security: Validate department against whitelist
  if (!isValidDepartment(department)) {
    return {
      output: [
        `[ERROR] Unknown department: ${department}`,
        '',
        'Available departments:',
        ...DEPARTMENTS,
      ],
      type: 'error',
    };
  }

  return {
    output: [
      '[OK] Switching department...',
      '',
      `[OK] Department: ${department}`,
      '[OK] Recruitment index loaded.',
    ],
    type: 'system',
    newDepartment: department,
  };
};

const handleLs: CommandHandler = async (args, currentDepartment) => {
  if (!currentDepartment) {
    return {
      output: [
        '[ERROR] No department selected.',
        '',
        'Use /cd <department> to select a department first.',
        'Type /departments to see available departments.',
      ],
      type: 'error',
    };
  }

  try {
    const response = await recruitmentApi.getDepartmentMembers(currentDepartment);
    
    if (response.members.length === 0) {
      return {
        output: [
          '[OK] Recruitment index loaded.',
          '',
          'NO MEMBERS FOUND.',
          '',
          `Department "${currentDepartment}" currently contains 0 recruited members.`,
        ],
        type: 'output',
      };
    }

    const header = `[ CYSCOM // ${currentDepartment.toUpperCase()} RECRUITMENT INDEX ]`;
    const separator = '─'.repeat(50);
    const tableHeader = 'ID       NAME';
    
    const members = response.members.map(m => 
      `${m.id.padEnd(8)} ${m.name}`
    );

    return {
      output: [
        header,
        '',
        tableHeader,
        separator,
        ...members,
        '',
        `${response.members.length} MEMBER${response.members.length !== 1 ? 'S' : ''} FOUND`,
      ],
      type: 'output',
    };
  } catch (error) {
    return {
      output: [
        '[ERROR] Unable to load recruitment index.',
        '',
        'The recruitment database may be temporarily unavailable.',
      ],
      type: 'error',
    };
  }
};

const handlePwd: CommandHandler = async (args, currentDepartment) => ({
  output: [`/current/${currentDepartment || '~'}`],
  type: 'output',
});

const handleClear: CommandHandler = async () => ({
  output: [],
  type: 'output',
  shouldClear: true,
});

const handleWhoami: CommandHandler = async () => {
  try {
    const response = await recruitmentApi.whoami();
    return {
      output: [
        'ACCESS IDENTITY',
        '────────────────────',
        '',
        `USER        ${response.user}`,
        `ROLE        ${response.role}`,
        `ACCESS      ${response.access}`,
        `SESSION     ${response.session}`,
      ],
      type: 'output',
    };
  } catch {
    return {
      output: [
        'ACCESS IDENTITY',
        '────────────────────',
        '',
        'USER        guest',
        'ROLE        recruitment-viewer',
        'ACCESS      READ-ONLY',
        'SESSION     ACTIVE',
      ],
      type: 'output',
    };
  }
};

const handleDepartments: CommandHandler = async () => ({
  output: [
    'CYSCOM DEPARTMENTS',
    '────────────────────────────',
    '',
    ...DEPARTMENTS.map((d, i) => `[${String(i + 1).padStart(2, '0')}] ${d}`),
    '',
    'Use:',
    '',
    '/cd <department>',
    '',
    'Example:',
    '',
    '/cd WebD',
  ],
  type: 'output',
});

const handleStatus: CommandHandler = async (args, currentDepartment) => {
  try {
    const response = await recruitmentApi.getStatus();
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    return {
      output: [
        'CYSCOM SYSTEM STATUS',
        '────────────────────────────────────',
        '',
        `CORE SYSTEM       [ ${response.coreSystem} ]`,
        `DATABASE          [ ${response.database} ]`,
        `RECRUITMENT DATA  [ ${response.recruitmentData} ]`,
        `AUTHENTICATION    [ ${response.authentication} ]`,
        `API               [ ${response.api} ]`,
        '',
        `DEPARTMENTS       ${response.totalDepartments}`,
        `CURRENT           ${currentDepartment || 'None'}`,
        '',
        `SYSTEM TIME       ${time}`,
      ],
      type: 'output',
    };
  } catch {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    return {
      output: [
        'CYSCOM SYSTEM STATUS',
        '────────────────────────────────────',
        '',
        'CORE SYSTEM       [ ONLINE ]',
        'DATABASE          [ ONLINE ]',
        'RECRUITMENT DATA  [ ONLINE ]',
        'AUTHENTICATION    [ ACTIVE ]',
        'API               [ ONLINE ]',
        '',
        'DEPARTMENTS       6',
        `CURRENT           ${currentDepartment || 'None'}`,
        '',
        `SYSTEM TIME       ${time}`,
      ],
      type: 'output',
    };
  }
};

const handleAbout: CommandHandler = async () => ({
  output: [
    'CYSCOM - CYBER SECURITY COMMUNITY',
    '────────────────────────────────────────────',
    '',
    'CYSCOM is a student-led cybersecurity community focused on',
    'building skills in ethical hacking, security research, and',
    'defensive security practices.',
    '',
    'This terminal provides read-only access to recruitment data.',
    '',
    'For more information, visit our official channels.',
  ],
  type: 'output',
});

const handleBanner: CommandHandler = async () => ({
  output: [formatBanner()],
  type: 'system',
});

const handleExit: CommandHandler = async () => ({
  output: [
    '[OK] Returning to initial state...',
    '',
    'Welcome back to CYSCOM Recruitment Terminal.',
    'Type /help for available commands.',
  ],
  type: 'system',
  newDepartment: null,
});

const handleUnknown: CommandHandler = async (args) => ({
  output: [
    `[ERROR] Command not found: /${args[0] || 'unknown'}`,
    '',
    'Type /help for available commands.',
  ],
  type: 'error',
});

export const commandHandlers: Record<string, CommandHandler> = {
  help: handleHelp,
  ls: handleLs,
  cd: handleCd,
  pwd: handlePwd,
  clear: handleClear,
  whoami: handleWhoami,
  departments: handleDepartments,
  status: handleStatus,
  about: handleAbout,
  banner: handleBanner,
  exit: handleExit,
};

export const parseCommand = (input: string): { command: string; args: string[] } => {
  const trimmed = input.trim();
  
  // Remove leading slash if present
  const commandPart = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  
  const parts = commandPart.split(/\s+/).filter(Boolean);
  const command = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1);
  
  return { command, args };
};

export const executeCommand = async (
  input: string,
  currentDepartment: string | null
): Promise<CommandHandlerResult> => {
  const { command, args } = parseCommand(input);
  
  if (!command) {
    return { output: [], type: 'output' };
  }

  const handler = commandHandlers[command] || handleUnknown;
  return handler(args, currentDepartment);
};
