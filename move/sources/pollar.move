
module pollarapp::pollar;

use sui::object::{Self, ID, UID}; 
use sui::event;
use std::option::{Self, Option};
use std::string::String;
use sui::dynamic_field as df;
use std::vector;

public struct User has key, store 
{
    id: UID,
    icon_url: String,
    name: String,
}

public struct UserMinted has copy, drop
{
    user: ID,
    owner: address
}

public struct Poll has key, store 
{
    id: UID,
    name: String,
    description: String,
    image_url: String,
    start_date: String,
    end_date: String,
    options: vector<PollOption>
}

public struct PollMinted has copy, drop
{
    poll: object::ID,
    owner: address
}

public struct PollOption has key, store 
{
    id: UID,
    name: String,
    image_url: String
}


public fun create_poll_option(name: String, image_url: String, ctx: &mut TxContext): PollOption
{
    let pollOption = PollOption 
    {
        id: object::new(ctx), // creates a new UID
        name,
        image_url
    };
    pollOption
}

public fun create_poll(name: String, description: String, image_url: String, start_date: String, end_date: String, options: vector<PollOption>, ctx: &mut TxContext): Poll
{
    let poll = Poll 
    {
        id: object::new(ctx), // creates a new UID
        name,
        description,
        image_url,
        start_date,
        end_date,
        options
    };
    poll
}

public fun create_user(name: String, icon_url: String, ctx: &mut TxContext): User
{
    let user = User 
    {
        id: object::new(ctx), // creates a new UID
        icon_url,
        name
    };
    user
}

public entry fun mint_poll(name: String, description: String, image_url: String, start_date: String, end_date: String, options: vector<PollOption>,  ctx: &mut TxContext)
{
    let poll = create_poll(name, description, image_url, start_date, end_date, options, ctx);
    let inner_id = object::id(&poll);
    
    event::emit(PollMinted{ poll: inner_id, owner: ctx.sender() });
    transfer::transfer(poll, ctx.sender());
}

public entry fun mint_user(name: String, icon_url: String, hacker_id: String, twitter_link: String, created_date: String, ctx: &mut TxContext)
{
    let user = create_user(name, icon_url, ctx);
    let inner_id = object::id(&user);
    event::emit(UserMinted{ user: inner_id, owner: ctx.sender() });
    transfer::transfer(user, ctx.sender());
}

public entry fun delete_poll(poll: Poll, ctx: &mut TxContext)
{
    let Poll { id, name: _, description: _, image_url: _, start_date: _, end_date: _, options: mut options } = poll;
    while (!vector::is_empty(&options)) 
    {
        let mut pollOption = vector::pop_back(&mut options);
        let PollOption { id: pid, name: _, image_url: _ } = pollOption;
        object::delete(pid);
    };
    vector::destroy_empty(options);
    object::delete(id);
}

public entry fun delete_user(user: User, ctx: &mut TxContext)
{
    let User { id, name: _, icon_url: _ } = user;
    object::delete(id);
}