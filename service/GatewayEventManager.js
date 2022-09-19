"use strict";

const Game = require( "../Game" );
const DataModel = require( "../DataModel" );
const Utils = require( "../Utils" );


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function GatewayEventManager() 
{
	this._gameEventManager = null;
};
module.exports = GatewayEventManager;
GatewayEventManager.prototype.constructor = GatewayEventManager;


//===================================================
// Public
//===================================================

GatewayEventManager.prototype.init = function() {};
GatewayEventManager.prototype.end = function() {};

GatewayEventManager.prototype.add = function( user ) 
{
	// Player list.
	user.socket.on( "retrieveUserList", Utils.callAndCatchErrors.bind( this, this._onRetrieveUserList, user ) );
	user.socket.on( "inviteToGame", Utils.callAndCatchErrors.bind( this, this._onInviteToChallenge, user ) );
	user.socket.on( "cancelGameInvitation", Utils.callAndCatchErrors.bind( this, this._onCancelChallengeInvitation, user ) );
	user.socket.on( "acceptGameInvitation", Utils.callAndCatchErrors.bind( this, this._onAcceptChallengeInvitation, user ) );
	user.socket.on( "rejectGameInvitation", Utils.callAndCatchErrors.bind( this, this._onRejectChallengeInvitation, user ) );
	user.socket.on( "setUserStatus", Utils.callAndCatchErrors.bind( this, this._onSetUserStatus, user ) );
	// Game room.
	user.socket.on( "clearLastGameRoom", Utils.callAndCatchErrors.bind( this, this._onClearLastGameRoom, user ) );
	user.socket.on( "retrieveGameRoom", Utils.callAndCatchErrors.bind( this, this._onRetrieveGameRoom, user ) );
	user.socket.on( "setReadyStatus", Utils.callAndCatchErrors.bind( this, this._onSetReadyStatus, user ) );
	user.socket.on( "setScenario", Utils.callAndCatchErrors.bind( this, this._onSetScenario, user ) );
	user.socket.on( "setIsCampaignMode", Utils.callAndCatchErrors.bind( this, this._onSetIsCampaignMode, user ) );
	user.socket.on( "setCampaignLog", Utils.callAndCatchErrors.bind( this, this._onSetCampaignLog, user ) );
	user.socket.on( "setTreasureList", Utils.callAndCatchErrors.bind( this, this._onSetTreasureList, user ) );
	user.socket.on( "startGame", Utils.callAndCatchErrors.bind( this, this._onStartGame, user ) );
	user.socket.on( "loadGame", Utils.callAndCatchErrors.bind( this, this._onLoadGame, user ) );
	user.socket.on( "leaveGameRoom", Utils.callAndCatchErrors.bind( this, this._onLeaveGameRoom, user ) );
	user.socket.on( "opponentGameCreated", Utils.callAndCatchErrors.bind( this, this._onOpponentGameCreated, user ) );
	// Chat.
	user.socket.on( "sendPrivateMessage", Utils.callAndCatchErrors.bind( this, this._onSendPrivateMessage, user ) );
	user.socket.on( "sendGlobalMessage", Utils.callAndCatchErrors.bind( this, this._onSendGlobalMessage, user ) );
	user.socket.on( "sendGameMessage", Utils.callAndCatchErrors.bind( this, this._onSendGameMessage, user ) );
};

GatewayEventManager.prototype.remove = function( user ) 
{
	// Player list.
	user.socket.removeAllListeners( "retrieveUserList" );
	user.socket.removeAllListeners( "inviteToGame" );
	user.socket.removeAllListeners( "cancelGameInvitation" );
	user.socket.removeAllListeners( "acceptGameInvitation" );
	user.socket.removeAllListeners( "rejectGameInvitation" );
	user.socket.removeAllListeners( "setUserStatus" );
	// Game room.
	user.socket.removeAllListeners( "clearLastGameRoom" );
	user.socket.removeAllListeners( "retrieveGameRoom" );
	user.socket.removeAllListeners( "setReadyStatus" );
	user.socket.removeAllListeners( "setScenario" );
	user.socket.removeAllListeners( "setIsCampaignMode" );
	user.socket.removeAllListeners( "setCampaignLog" );
	user.socket.removeAllListeners( "setTreasureList" );
	user.socket.removeAllListeners( "startGame" );
	user.socket.removeAllListeners( "loadGame" );
	user.socket.removeAllListeners( "leaveGameRoom" );
	user.socket.removeAllListeners( "opponentGameCreated" );
	// Chat.
	user.socket.removeAllListeners( "sendPrivateMessage" );
	user.socket.removeAllListeners( "sendGlobalMessage" );
	user.socket.removeAllListeners( "sendGameMessage" );
};


//===================================================
// Private
//===================================================

// #region Player List //

GatewayEventManager.prototype._onRetrieveUserList = function( myUser ) 
{
	let arrUser = [];
	for ( const [ key, value ] of DataModel.mapUserIdToUser.entries() )  
	{
		arrUser.push( { id: key, status: value.userStatus } );
	}

	myUser.socket.emit( "userListRetrieved", arrUser );
};

GatewayEventManager.prototype._onInviteToChallenge = function( myUser, userId, gameType ) 
{
	myUser.setUserStatus( 1 );

	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.socket.emit( "gameInvitationReceived", myUser.userId, gameType );

		oppUser.setUserStatus( 1 );
	}
};

GatewayEventManager.prototype._onCancelChallengeInvitation = function( myUser, userId ) 
{
	myUser.setUserStatus( 0 );

	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.socket.emit( "gameInvitationCanceled", myUser.userId );

		oppUser.setUserStatus( 0 );
	}
};

GatewayEventManager.prototype._onAcceptChallengeInvitation = function( myUser, userId )
{
	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.opponent = myUser;

		myUser.opponent = oppUser;
		
		oppUser.socket.emit( "gameInvitationAccepted", myUser.userId );
	}
	myUser.setUserStatus( 2 );
};

GatewayEventManager.prototype._onRejectChallengeInvitation = function( myUser, userId )
{
	if ( DataModel.mapUserIdToUser.has( userId ) )
	{
		let oppUser = DataModel.mapUserIdToUser.get( userId );
		oppUser.socket.emit( "gameInvitationRejected", myUser.userId );

		oppUser.setUserStatus( 0 );
	}
	myUser.setUserStatus( 0 );
};

GatewayEventManager.prototype._onSetUserStatus = function( myUser, userStatus )
{
	myUser.setUserStatus( userStatus );
};

// #endregion //

// #region Game Room //

GatewayEventManager.prototype._onClearLastGameRoom = function( myUser )
{
	myUser.deck = null;
	myUser.scenarioId = null;
	myUser.isCampaignMode = false;
	myUser.campaignLog = null;
	myUser.treasureList = null;
};

GatewayEventManager.prototype._onRetrieveGameRoom = function( myUser )
{
	myUser.socket.emit( "gameRoomRetrieved", myUser.opponent.deck, myUser.opponent.scenarioId, myUser.opponent.isCampaignMode,  myUser.opponent.campaignLog,  myUser.opponent.treasureList );
};

GatewayEventManager.prototype._onSetReadyStatus = function( myUser, deck )
{
	myUser.deck = deck;

	if ( myUser.opponent )
	{
		let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
		oppUser.socket.emit( "userReadyReceived", deck );
	}
};

GatewayEventManager.prototype._onSetScenario = function( myUser, scenarioId )
{
	myUser.scenarioId = scenarioId;

	if ( myUser.opponent )
	{
		let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
		oppUser.socket.emit( "scenarioReceived", scenarioId );
	}
};

GatewayEventManager.prototype._onSetIsCampaignMode = function( myUser, isCampaignMode )
{
	myUser.isCampaignMode = isCampaignMode;

	if ( myUser.opponent )
	{
		let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
		oppUser.socket.emit( "isCampaignModeReceived", isCampaignMode );
	}
};

GatewayEventManager.prototype._onSetCampaignLog = function( myUser, campaignLog )
{
	myUser.campaignLog = campaignLog;

	if ( myUser.opponent )
	{
		let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
		oppUser.socket.emit( "campaignLogReceived", campaignLog );
	}
};

GatewayEventManager.prototype._onSetTreasureList = function( myUser, treasureList )
{
	myUser.treasureList = treasureList;

	if ( myUser.opponent )
	{
		let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
		oppUser.socket.emit( "treasureListReceived", treasureList );
	}
};

GatewayEventManager.prototype._onStartGame = function( myUser )
{
	let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );

	// Notify players.
	const kPrngSeed = Math.floor( Math.random() * 10000 );
	const kFirstPlayerId = Math.random() > 0.5 ? oppUser.userId : myUser.userId;
	const kGameId = myUser.userId + "_&_" + oppUser.userId + "_" + Date.now().toString();
	myUser.socket.emit( "gameCreated", oppUser.deck, kPrngSeed, kFirstPlayerId, kGameId );
	oppUser.socket.emit( "gameCreated", myUser.deck, kPrngSeed, kFirstPlayerId, kGameId );

	// Create the game.
	let game = new Game();
	game.gameId = kGameId;
	game.init();
	game.players.push( myUser );
	game.players.push( oppUser )
	DataModel.mapGameIdToGame.set( kGameId, game );

	myUser.gameId = kGameId;
	oppUser.gameId = kGameId;

	this._gameEventManager.add( myUser );
	this._gameEventManager.add( oppUser );

	oppUser.setUserStatus( 3 );
	myUser.setUserStatus( 3 );
};

GatewayEventManager.prototype._onLoadGame = function( myUser, saveGame )
{
	// Notify player.
	const kPrngSeed = Math.floor( Math.random() * 10000 );
	const kGameId = myUser.userId + "_&_" + saveGame.session.allyId + "_" + Date.now().toString();
	myUser.socket.emit( "gameLoaded", kPrngSeed, kGameId, saveGame );

	// Create the game.
	let game = new Game();
	game.gameId = kGameId;
	game.init();
	game.players.push( myUser );
	//
	myUser.gameId = kGameId;
	DataModel.mapGameIdToGame.set( kGameId, game );

	this._gameEventManager.add( myUser );

	if ( saveGame.session.allyId && myUser.opponent )
	{
		let oppUser = DataModel.mapUserIdToUser.get( myUser.opponent.userId );
		oppUser.opponent = myUser;

		// Notify ally.
		oppUser.socket.emit( "gameLoaded", kPrngSeed, kGameId, saveGame );
		
		game.players.push( oppUser )
		oppUser.gameId = kGameId;

		this._gameEventManager.add( oppUser );

		oppUser.setUserStatus( 3 );
	}

	myUser.setUserStatus( 3 );
};

GatewayEventManager.prototype._onLeaveGameRoom = function( myUser, isHost ) 
{
	let oppUser = myUser.opponent;
	if ( oppUser )
	{
		oppUser.socket.emit( "userLeftRoom", myUser.userId );
		if ( isHost )
		{			
			oppUser.setUserStatus( 0 );
		}
	}
	myUser.setUserStatus( 0 );
};

GatewayEventManager.prototype._onOpponentGameCreated = function( myUser ) 
{
	let oppUser = myUser.opponent;
	oppUser.socket.emit( "opponentGameCreated" );
};

// #endregion //

// #region Chat //

GatewayEventManager.prototype._onSendPrivateMessage = function( myUser, to, message )
{
	if ( DataModel.mapUserIdToUser.has( to ) )
	{
		DataModel.mapUserIdToUser.get( to ).socket.emit( "privateMessageReceived", myUser.userId, message, new Date() );
	}
};

GatewayEventManager.prototype._onSendGlobalMessage = function( myUser, message ) 
{
	myUser.socket.broadcast.emit( "globalMessageReceived", myUser.userId, message, new Date() );
};

GatewayEventManager.prototype._onSendGameMessage = function( myUser, message ) 
{
	if ( DataModel.mapUserIdToUser.has( myUser.opponent.userId ) )
	{
		DataModel.mapUserIdToUser.get( myUser.opponent.userId ).socket.emit( "gameMessageReceived", myUser.userId, message, new Date() );
	}
};

// #endregion //


//===================================================
// Getters / Setters
//===================================================

// Signals.
Object.defineProperty(
	GatewayEventManager.prototype, 
	"gameEventManager", 
    { set: function( value ) { this._gameEventManager = value; } } );