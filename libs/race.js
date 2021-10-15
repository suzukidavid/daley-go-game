const { 
  MintLayout, 
  Token, 
  u64,
  TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const { 
  Connection, 
  PublicKey, 
  Keypair, 
  LAMPORTS_PER_SOL, 
  SystemProgram, 
  TransactionInstruction, 
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const borsh = require('borsh');
require('./extendBorsh');

const opts = {
  preflightCommitment: "processed"
}

const network = process.env.NETWORK || "https://api.devnet.solana.com";
const connection = new Connection(network, opts.preflightCommitment);

function intToBool(i) {
  if (i == 0) {
    return false
  } else {
    return true
  }
}

function boolToInt(t) {
  if (t) {
    return 1
  } else {
    return 0
  }
}

const boolMapper = {
  encode: boolToInt,
  decode: intToBool
}

class Player {
  address = null;
  slot = 0;
  constructor(args) {
    this.address = args.address;
    this.slot = Number(args.slot);
  }
}

class RaceAccount {
  status = false;
  level = 0;
  date = Date.now();
  name     = '                                                                           ';
  location = '                              ';
  distance = 1000;
  entry_fee = 0;
  prize_pool = 0;
  game_url = '                                                                           ';
  players = null;
  type = 0;
  end_date = 0;
  constructor(fields) {
    Object.assign(this, fields);
  }
}

const RaceFields = [
  ['status', 'u8'],
  ['level', 'u8'],
  ['type', 'u8'],
  ['date', 'u64'],
  ['name', 'string'],
  ['location', 'string'],
  ['distance', 'u16'],
  ['entry_fee', 'u16'],
  ['prize_pool', 'u16'],
];

class UpdateRaceArgs {
  instruction = 0;
  status = 0;
  level = 0;
  type = 0;
  date = Date.now();
  name     = '                                                                               ';
  location = '                              ';
  distance = 1000;
  entry_fee = 0;
  prize_pool = 5000;
  constructor(fields) {
    Object.assign(this, fields, {
      instruction: 0
    });
  }
}

class UpdateGameArgs {
  instruction = 1;
  game_url = '';
  end_date = 0;
  constructor(fields) {
    this.game_url = fields.game_url;
    this.end_date = fields.end_date;
  }
}

class JoinRaceArgs {
  instruction = 2;
  player = null;
  constructor(fields) {
    this.player = fields.player
  }
}

const RaceSchema = new Map([
  [
    RaceAccount, 
    {
      kind: 'struct', 
      fields: [
        ...RaceFields,
        ['game_url', 'string'],
        ['end_date', 'u64'],
        ['players', { kind: 'option', type: [Player] }],
      ]
    }
  ],
  [
    Player,
    {
      kind: 'struct',
      fields: [
        ['address', 'pubkeyAsString'],
        ['slot', 'u8'],
      ],
    },
  ],
  [
    UpdateRaceArgs, 
    {
      kind: 'struct', 
      fields: [
        ['instruction', 'u8'],
        ...RaceFields,
      ]
    }
  ],
  [
    UpdateGameArgs, 
    {
      kind: 'struct', 
      fields: [
        ['instruction', 'u8'],
        ['game_url', 'string'],
        ['end_date', 'u64'],
      ]
    }
  ],
  [
    JoinRaceArgs, 
    {
      kind: 'struct', 
      fields: [
        ['instruction', 'u8'],
        ['player', Player],
      ]
    }
  ],
]);

const RACE_PROGRAM_ID =  new PublicKey('9aNvpwkX2Md36Lf3g8rEzuTtyJiykWMu7JkYubkReVe6');
const RACE_SIZE = 768
// borsh.serialize(
//   RaceSchema,
//   new RaceAccount({players:new Array(12).fill(new Player({slot:0, address:'9aNvpwkX2Md36Lf3g8rEzuTtyJiykWMu7JkYubkReVe6'}))}),
// ).length;
//console.log('RACE_SIZE', RACE_SIZE)

function decodeRace(data) {
  const race = borsh.deserializeUnchecked(RaceSchema, RaceAccount, data);
  race.date = race.date.toNumber();
  race.end_date = race.end_date ? race.end_date.toNumber() : 0;
  race.runIn = new Date(race.date).toISOString();
  return race;
}

async function listRace() {
  var accounts = await connection.getProgramAccounts(RACE_PROGRAM_ID);
  //console.log( accounts )
  // accounts.forEach(a=>{
  //   console.log('Address', a.pubkey.toBase58());
  //   console.log('Owner', a.account.owner.toBase58())
  //   //console.log('Data', a.account.data);
  //   console.log(decodeRace(a.account.data));
  // })
  return accounts.map(a=>{
    var race = decodeRace(a.account.data);
    return {
      address: a.pubkey.toBase58(),
      ...race,
    }
  });
}

async function getRace(address) {
  var pubkey = new PublicKey(address)
  const a = await connection.getAccountInfo(pubkey);
  return {
    address: pubkey.toBase58(),
    ...decodeRace(a.data)
  }
}

module.exports = {
  Player,
  RaceAccount,
  UpdateRaceArgs,
  UpdateGameArgs,
  JoinRaceArgs,
  RaceSchema,
  RACE_PROGRAM_ID,
  RACE_SIZE,
  decodeRace,
  listRace,
  getRace,
}