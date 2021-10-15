// Node v14.17.6
require('dotenv').config()
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
const fs = require('fs');
//const MEMO_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const { gameServer } = require('./gs')
const {
  Player, 
  RaceAccount,
  UpdateRaceArgs,
  UpdateGameArgs,
  JoinRaceArgs,
  RaceSchema,
  RACE_SIZE,
  decodeRace,
} = require('./libs/race');

//console.log('RACE_SIZE', RACE_SIZE)

const opts = {
  preflightCommitment: "processed"
}

const network = process.env.NETWORK || "https://api.devnet.solana.com";
const connection = new Connection(network, opts.preflightCommitment);

const SOLANA_ID_PATH = process.env.SOLANA_ID_PATH || "./id.json";
const SOLANA_ID = require(SOLANA_ID_PATH);

const RACE_PROGRAM_ID =  new PublicKey(process.env.RACE_PROGRAM_ID || '9aNvpwkX2Md36Lf3g8rEzuTtyJiykWMu7JkYubkReVe6');

const DATA_URL = process.env.DATA_URL || 'http://localhost:3000/data/'

console.log('SOLANA NETWORK:', network);

async function getWallet() {
  const id = SOLANA_ID;
  const wallet = await Keypair.fromSecretKey(Uint8Array.from(id));
  const connection = new Connection(network, opts.preflightCommitment);
  return {
    publicKey: wallet.publicKey,
    secretKey: wallet.secretKey,
    connection, 
    wallet,
    sendAndConfirmTransaction: async (transaction)=>{
      return sendAndConfirmTransaction(connection, transaction, [wallet])
    },
    signTransaction: async (transaction)=>{
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      transaction.sign(wallet);
      if (!transaction.signature) {
        throw new Error('!signature'); // should never happen
      }
      return transaction;
    }
  }
}

async function showBalance(connection, publicKey, msg) {
  const balance = await connection.getBalance(publicKey);
  console.log(msg, publicKey.toBase58(), balance/LAMPORTS_PER_SOL);
}

async function transfer(connection, wallet, to, amount) {
  console.log(`Transfer ${amount} SOL from ${wallet.publicKey.toBase58()} to ${to.toBase58()}`)
  // Add transfer instruction to transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: to,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  );

  var signed = await wallet.signTransaction(transaction);
  console.log( 'Signed', signed)
}

async function updateGame(options) {
  const wallet = await getWallet();
  const {connection} = wallet;
  const publicKey = wallet.publicKey;

  let racePubkey = new PublicKey(options.address||options.game);
  const raceAccount = await connection.getAccountInfo(racePubkey);
  if ( raceAccount == null ) {
    console.log('Race Account not exists!');
    return;
  }

  var game_url = options.game_url || '';
  var end_date = options.end_date || 0;
  var race = decodeRace(raceAccount.data);
  race.game_url = game_url
  var raceData = borsh.serialize(RaceSchema,race);
  if ( raceData.length > RACE_SIZE ) {
    console.log('Data too large!', data.length, RACE_SIZE);
    return;
  }

  console.log('Update Game for Race:', racePubkey.toBase58());
  var updateGameArgs = new UpdateGameArgs({game_url, end_date});
  //console.log('Update', updateGameArgs);
  var data = borsh.serialize(RaceSchema,updateGameArgs);
  //console.log('Data', data);
  const instruction = new TransactionInstruction({
    keys: [{pubkey: racePubkey, isSigner: false, isWritable: true}],
    programId: RACE_PROGRAM_ID,
    data: Buffer.from(data), // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [wallet],
  );

  const accountInfo = await connection.getAccountInfo(racePubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the race account';
  }
  console.log('Account Info', accountInfo, accountInfo.data.length)
  console.log(decodeRace(accountInfo.data));

}

async function createRace(options) {
  const wallet = await getWallet();
  const {connection} = wallet;
  const publicKey = wallet.publicKey;

  var m = new Date(options.date);
  if ( !options.date || isNaN(m.getTime()) ) {
    console.log('Invalid date!', options.date)
    return;
  }
  //var dateString = m.getUTCFullYear() +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();
  var dateString =
    m.getUTCFullYear() + "" +
    ("0" + (m.getUTCMonth()+1)).slice(-2) + "" +
    ("0" + m.getUTCDate()).slice(-2) + "" +
    ("0" + m.getUTCHours()).slice(-2) + "" +
    ("0" + m.getUTCMinutes()).slice(-2) + ""
    //("0" + m.getUTCSeconds()).slice(-2);
  console.log(dateString);
  var defaultSeed = dateString + (options.location ? ('[' + options.location + ']') : '')

  const SEED = options.seed || defaultSeed;
  let racePubkey = options.address ? new PublicKey(options.address) : (await PublicKey.createWithSeed(
    wallet.publicKey,
    SEED,
    RACE_PROGRAM_ID,
  ));
  console.log('SEED', SEED)
  console.log('racePubkey', racePubkey.toBase58());

  // Check if the greeting account has already been created
  const raceAccount = await connection.getAccountInfo(racePubkey);
  if (raceAccount === null) {
    console.log(
      'Creating Race account',
      racePubkey.toBase58(),
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(RACE_SIZE);

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: wallet.publicKey,
        basePubkey: wallet.publicKey,
        seed: SEED,
        newAccountPubkey: racePubkey,
        lamports,
        space: RACE_SIZE,
        programId: RACE_PROGRAM_ID,
      }),
    );
    await sendAndConfirmTransaction(connection, transaction, [wallet]);
  }

  console.log('Update Race for ', racePubkey.toBase58());
  var updateRaceArgs = new UpdateRaceArgs({
    name: options.name || 'Venus Angels', 
    location: options.location || 'Venus',
    level: options.level !== undefined ? options.level : 0,
    date: m.getTime(), 
    entry_fee: options.entryFee || 0, 
    prize_pool: options.prizePool || 5400,
    canceled: options.canceled || false,
  });
  var data = borsh.serialize(RaceSchema,updateRaceArgs);
  if ( data.length > RACE_SIZE ) {
    console.log('Data too large!', data.length, RACE_SIZE);
    return;
  }
  console.log('Data', data);
  const instruction = new TransactionInstruction({
    keys: [{pubkey: racePubkey, isSigner: false, isWritable: true}],
    programId: RACE_PROGRAM_ID,
    data: Buffer.from(data), // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [wallet],
  );

  const accountInfo = await connection.getAccountInfo(racePubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the race account';
  }
  console.log('Account Info', accountInfo, accountInfo.data.length)
  console.log(decodeRace(accountInfo.data));
}

async function joinRace(options) {
  const wallet = await getWallet();
  const {connection} = wallet;

  let racePubkey = new PublicKey(options.join);
  const raceAccount = await connection.getAccountInfo(racePubkey);
  if ( raceAccount == null ) {
    console.log('Race Account not exists!');
    return;
  }

  var address = options.address;
  var slot = options.slot;
  if ( !address || !slot ) {
    console.log('Please provide address and slot!')
    return;
  }
  // var race = decodeRace(raceAccount.data);
  // race.game_url = game_url
  // var raceData = borsh.serialize(RaceSchema,race);
  // if ( raceData.length > RACE_SIZE ) {
  //   console.log('Data too large!', data.length, RACE_SIZE);
  //   return;
  // }

  console.log('Join Game for Race:', racePubkey.toBase58());
  var joinRaceArgs = new JoinRaceArgs({player: new Player({address,slot})});
  console.log('Join', joinRaceArgs);
  var data = borsh.serialize(RaceSchema,joinRaceArgs);
  console.log('Data', data);
  const instruction = new TransactionInstruction({
    keys: [{pubkey: racePubkey, isSigner: false, isWritable: true}],
    programId: RACE_PROGRAM_ID,
    data: Buffer.from(data), // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [wallet],
  );

  const accountInfo = await connection.getAccountInfo(racePubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the race account';
  }
  console.log('Account Info', accountInfo, accountInfo.data.length)
  console.log(decodeRace(accountInfo.data));
}

async function showRace(options) {
  const {connection} = await getWallet();

  let racePubkey = new PublicKey(options.address||options.show);
  const accountInfo = await connection.getAccountInfo(racePubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the race account';
  }
  console.log('Account Info', accountInfo, accountInfo.data.length)
  console.log(decodeRace(accountInfo.data));
}

async function listRace(options) {
  const wallet = await getWallet();
  const {connection} = wallet;

  var accounts = await connection.getProgramAccounts(RACE_PROGRAM_ID);
  //console.log( accounts )
  accounts.map(a=>{
    var race = decodeRace(a.account.data);
    race.address = a.pubkey.toBase58();
    race.owner = a.account.owner.toBase58();
    return race;
  }).sort((a,b)=>(a.date-b.date)).map(race=>{
    if ( options.long ) {
      //console.log('Address', race.address);
      //console.log('Owner', race.owner)
      //console.log('Data', a.account.data);
      console.log(race);
    } else {
      console.log(race.address, race.date, race.runIn, race.status, race.level, race.name, '('+race.location+')')
    } 
  })
}

async function initRace(options) {
  const raceData = require(options.init);
  console.log(raceData)
  for(var i=0; i<raceData.length; i++) {
    await createRace({
      ...raceData[i],
      entryFee: Math.round(raceData[i].entryFee * 1000),
      prizePool: Math.round(raceData[i].prizePool * 1000),
    });
  }
}

async function gs(options) {
  const {connection} = await getWallet();

  var address = options.address||options.gs;
  let racePubkey = new PublicKey(address);
  const raceAccount = await connection.getAccountInfo(racePubkey);
  if ( raceAccount == null ) {
    console.log('Race Account not exists!');
    return;
  }
  if ( options.format == undefined ) {
    options.format = 1;
  }
  var race = decodeRace(raceAccount.data);
  race.address = address;
  console.log('Race', race);

  console.log('Start', race.runIn);
  await gameServer(options, race);
  var end = new Date(race.date+race.place[11][1]);
  console.log('End', end);

  var filename = address+'.json';
  var outFile = options.out || ('public/data/'+filename);
  var jsonData = options.debug ? JSON.stringify(race,null,2) : JSON.stringify(race);
  fs.writeFileSync(outFile, jsonData);
  console.log('File write to : ', outFile)

  var game_url = DATA_URL + filename;
  var end_date = end.getTime();
  console.log('URL: ', game_url);

  await updateGame({
    address,
    game_url,
    end_date,
  })

}

async function run(options) {
  if ( options.init ) {
    await initRace(options);
  }
  if ( options.create ) {
    await createRace(options);
  }
  if ( options.game ) {
    await updateGame(options);
  }
  if ( options.join ) {
    await joinRace(options);
  }
  if ( options.show ) {
    await showRace(options);
  }
  if ( options.list ) {
    await listRace(options);
  }
  if ( options.gs ) {
    await gs(options);
  }
}

var options = {
}
for(var i=2; i<process.argv.length; i++) {
  var arg = process.argv[i];
  var vals = arg.split('=');
  if ( vals.length > 1 ) {
      options[vals[0]]=vals[1];
  } else {
      options[arg] = true;
  }
}
run(options).then(()=>{
  process.exit();
}).catch((e)=>{
  console.error(e);
  process.exit();
})
