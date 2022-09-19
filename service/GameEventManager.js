"use strict";

const DataModel = require( "../DataModel" );
const Utils = require( "../Utils" );


//===================================================
// Constructor
//===================================================

/**
 * @constructor
 */
function GameEventManager() {};
module.exports = GameEventManager;
GameEventManager.prototype.constructor = GameEventManager;


//===================================================
// Public
//===================================================

GameEventManager.prototype.init = function() {};
GameEventManager.prototype.end = function() {};

GameEventManager.prototype.add = function( user ) 
{
	user.socket.on( "notifyAction", Utils.callAndCatchErrors.bind( this, this._onNotifyAction, user ) );
	user.socket.on( "gameOver", Utils.callAndCatchErrors.bind( this, this._onGameOver, user ) );
	user.socket.on( "restart", Utils.callAndCatchErrors.bind( this, this._onRestart, user ) );
};

GameEventManager.prototype.remove = function( user ) 
{
	user.socket.removeAllListeners( "notifyAction" );
	user.socket.removeAllListeners( "gameOver" );
	user.socket.removeAllListeners( "restart" );
};


//===================================================
// Private
//===================================================

// #region Common //

GameEventManager.prototype._onNotifyAction = function( myUser, actionType, gameStateId, args, isEcho ) 
{
	if ( actionType == 1 )
	{
		// LOCK_GAME_ELEMENT
		if ( DataModel.mapGameIdToGame.has( myUser.gameId ) )
		{
			let game = DataModel.mapGameIdToGame.get( myUser.gameId );
			let isLocked = game.lockedGameObjects.indexOf( args[ 0 ] ) != -1;
			// LOCK_STATUS_RECEIVED
			myUser.socket.emit( "oppActionNotified", 3, null, [ isLocked, args[ 0 ] ] );
			if ( !isLocked )
			{
				game.lockedGameObjects.push( args[ 0 ] );
				myUser.opponent.socket.emit( "oppActionNotified", actionType, gameStateId, args );
			}
		}
	}
	else if ( actionType == 2 )
	{
		// UNLOCK_GAME_ELEMENT
		if ( DataModel.mapGameIdToGame.has( myUser.gameId ) )
		{
			let game = DataModel.mapGameIdToGame.get( myUser.gameId );
			const kLockedGameObjectIndex = game.lockedGameObjects.indexOf( args[ 0 ] );
			if ( kLockedGameObjectIndex != -1 )
			{
				game.lockedGameObjects.splice( kLockedGameObjectIndex, 1 );
			}
			myUser.opponent.socket.emit( "oppActionNotified", actionType, gameStateId, args );
		}
	}
	else
	{
		myUser.opponent.socket.emit( "oppActionNotified", actionType, gameStateId, args );
		if ( isEcho )
		{
			myUser.socket.emit( "oppActionNotified", actionType, gameStateId, args );
		}
	}
};

GameEventManager.prototype._onGameOver = function( myUser ) 
{
	if ( DataModel.mapGameIdToGame.has( myUser.gameId ) )
	{
		DataModel.mapGameIdToGame.delete( myUser.gameId );
	}

	this.remove( myUser );

	myUser.setUserStatus( 0 );
};

GameEventManager.prototype._onRestart = function( myUser ) 
{
	if ( DataModel.mapGameIdToGame.has( myUser.gameId ) )
	{
		DataModel.mapGameIdToGame.get( myUser.gameId ).restart();
	}
};

// #endregion //