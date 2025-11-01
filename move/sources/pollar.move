
module pollarapp::pollar;

use sui::event;
use std::option::{Self, Option};
use std::string::String;
use sui::dynamic_field as df;

public struct Poll has key, store 
{
    id: object::UID,
    name: String,
    description: String,
    image_url: String,
    start_date: String,
    end_date: String,
    options: vector<String>
}

public struct PollMinted has copy, drop
{
    poll: object::ID,
    owner: address
}


public fun create_poll(name: String, description: String, image_url: String, start_date: String, end_date: String, options: vector<String>, ctx: &mut TxContext): Poll
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

public entry fun mint_poll(name: String, hackathon_id: String, icon_url: String, banner_url: String, description: String, start_date: String, end_date: String, prize: u64, ctx: &mut TxContext)
{
    let poll = create_poll(name, description, icon_url, start_date, end_date, vector::empty<String>(), ctx);
    let inner_id = object::id(&poll);
    
    event::emit(PollMinted{ poll: inner_id, owner: ctx.sender() });
    transfer::transfer(poll, ctx.sender());
}