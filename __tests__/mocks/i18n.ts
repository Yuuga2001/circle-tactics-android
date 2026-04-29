// 全テストで共有できる useLang モックファクトリ
export const mockT = {
  // Common
  cancel: 'Cancel',
  ok: 'OK',
  leave: 'Leave',
  back: '← Back',
  backToTitle: 'Back to Title',
  newGame: 'New Game',
  playAgain: 'Play Again',
  titleBtn: 'Back to Title',
  menuLabel: 'Menu',
  leaveOnline: 'Leave',
  confirmNewGame: 'Start a new game?',
  confirmLeave: 'Leave and return to title?',
  confirmLeaveOnline: 'Leave the room and return to title?',

  // Title
  subtitle: 'subtitle',
  howToPlayTitle: 'HOW TO PLAY',
  rule1: 'rule1',
  rule2: 'rule2',
  rule3: 'rule3',
  playLocal: 'Play',
  playOnline: 'Online Play',
  setSeats: 'Set seats',
  chooseAtLeastOne: 'Choose at least one',
  start: 'Start',

  // Menu
  bgmLabel: 'BGM',
  seLabel: 'SE',
  soundOn: 'ON',
  soundOff: 'OFF',

  // Labels
  playerLabel: 'Player',
  aiLabel: 'AI',
  youLabel: 'You',
  hostLabel: 'you, host',
  yourHand: 'YOUR HAND',
  firstLabel: 'FIRST',
  skipLabel: 'SKIP',
  noMoves: 'No moves',

  // Game state
  pickingFirst: 'Picking first player...',
  goesFirst: (p: string) => `${p} goes first!`,
  turnYou: 'Your turn',
  turnPlayer: (p: string) => `Turn: ${p}`,
  aiThinking: (p: string) => `${p} is thinking...`,
  playerWins: (p: string) => `${p} WINS!`,
  draw: 'DRAW',
  winCell: 'All 3 sizes!',
  winRow: '4 in a row!',
  disconnected: (p: string, s: number) => `${p} disconnected (${s}s)`,
  secsLeft: (s: number) => `${s}s left`,
  secsOnly: (s: number) => `${s}s`,

  // Online lobby
  onlinePlay: 'Online Play',
  lobbyDesc: 'Create or join a room',
  createRoom: 'Create Room',
  joinRoom: 'Join Room',

  // Host screen
  hostingRoom: 'Hosting a Room',
  shareCode: 'Share the code',
  roomCode: 'Room Code',
  creatingRoom: 'Creating room...',
  copyRoomCode: 'Copy Room Code',
  copied: 'Copied!',
  copyUrl: 'Copy URL',
  playersInRoom: (n: number, max: number) => `Players (${n}/${max})`,
  aiSeats: (n: number) => `${n} AI seat(s)`,
  startGame: 'Start Game',
  starting: 'Starting...',

  // Join screen
  joinTitle: 'Join a Room',
  joinDesc: 'Enter the 6-digit code',
  enterCode: 'Enter code',
  joinBtn: 'Join',
  joining: 'Joining...',

  // Waiting room
  waitingTitle: 'Waiting for Host',
  waitingDesc: 'The host will start soon...',
  playersLabel: (n: number, max: number) => `Players (${n}/${max})`,
  youAre: (c: string) => `You are ${c}.`,

  // Spectator
  waitingToJoin: 'Waiting to join',
  queuePos: (n: number) => `#${n} in queue`,
  youreNext: "You're next",
  willJoinAuto: 'You will join automatically',
  joiningLabel: 'Joining...',
  loading: 'Loading…',
};

export const mockUseLang = () => ({
  t: mockT,
  lang: 'en' as const,
  isAuto: true,
  setLang: jest.fn(),
  setAuto: jest.fn(),
});
