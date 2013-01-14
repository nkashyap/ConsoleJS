/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 14/01/13
 * Time: 15:31
 * To change this template use File | Settings | File Templates.
 */

function ConsoleClient(manager, socket){
    this.manager = manager;
    this.socket = socket;
    this.id = this.socket.id;
}

ConsoleClient.prototype.remove = function remove(){

};


module.exports = ConsoleClient;