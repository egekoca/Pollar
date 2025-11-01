
module pollarapp::pollar;

use sui::package::Publisher;
use sui::object::{Self, ID, UID}; 
use sui::event;
use std::option::{Self, Option};
use std::string::String;
use std::vector;
use sui::dynamic_field as df;

const EInvalidPackageVersion: u64 = 1001;
const EVersionAlreadyUpdated: u64 = 1002;
const EInvalidPublisher: u64 = 1003;

// Error codes
const EInvalidNameLength: u64 = 0;
const EInvalidIconUrlLength: u64 = 1;
const EInvalidPollOption: u64 = 2;
const EInvalidPollNameLength: u64 = 3;
const EInvalidPollImageUrlLength: u64 = 4;
const EInvalidStartDateLength: u64 = 5;
const EInvalidEndDateLength: u64 = 6;
const EInvalidOptionsLength: u64 = 7; // Poll option is not in the poll's options list
const EAlreadyVoted: u64 = 8;

const VERSION: u64 = 1;

public struct Version has key 
{
    id: UID,
    version: u64
}

public struct VoteRegistry has key 
{
    id: UID,
    usersVoted: vector<ID>,
    votes: vector<ID>
}

public struct PollRegistry has key 
{
    id: UID,
}

public struct User has key, store 
{
    id: UID,
    name: String,
    icon_url: String,
    wallet: address,
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
    options: vector<PollOption>,
}

public struct PollMinted has copy, drop
{
    poll: ID,
    owner: address
}

public struct PollOption has key, store 
{
    id: UID,
    name: String,
    image_url: String
}

public struct UserVote has key, store 
{
    id: UID,
    user: User,
    poll: Poll,
    poll_option: PollOption
}

public struct UserVoteMinted has copy, drop
{
    user_vote: ID,
    owner: address
}

fun init(ctx: &mut TxContext) 
{
    transfer::share_object(PollRegistry { id: object::new(ctx)  });
    transfer::share_object(Version { id: object::new(ctx), version: VERSION });
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
        name,
        icon_url,
        wallet: ctx.sender(),
    };
    user
}

public fun create_user_vote(poll: Poll, poll_option: PollOption, user: User, ctx: &mut TxContext): UserVote
{
    let userVote = UserVote 
    {
        id: object::new(ctx), // creates a new UID
        user,
        poll,
        poll_option
    };
    userVote
}

public entry fun mint_poll(name: String, description: String, image_url: String, start_date: String, end_date: String, options: vector<PollOption>,  pollRegistry: &mut PollRegistry, ctx: &mut TxContext)
{
    // Validate poll name length (3-250 characters)
    let name_length = name.length();
    assert!(name_length >= 3 && name_length <= 250, EInvalidPollNameLength);

    // Validate image_url length (7-1000 characters)
    let image_url_length = image_url.length();
    assert!(image_url_length >= 7 && image_url_length <= 1000, EInvalidPollImageUrlLength);

    // Validate start_date length (3-100 characters)
    let start_date_length = start_date.length();
    assert!(start_date_length >= 3 && start_date_length <= 100, EInvalidStartDateLength);

    // Validate end_date length (3-100 characters)
    let end_date_length = end_date.length();
    assert!(end_date_length >= 3 && end_date_length <= 100, EInvalidEndDateLength);

    // Validate options length (minimum 2 options)
    let options_length = vector::length(&options);
    assert!(options_length >= 2, EInvalidOptionsLength);

    

    let poll = create_poll(name, description, image_url, start_date, end_date, options, ctx);
    let inner_id = object::id(&poll);
    
    let voteRegistry = VoteRegistry 
    {
        id: object::new(ctx),
        usersVoted: vector::empty(),
        votes: vector::empty()
    };

    df::add(&mut pollRegistry.id, inner_id, object::id(&voteRegistry));
    event::emit(PollMinted{ poll: inner_id, owner: ctx.sender() });
    transfer::transfer(poll, ctx.sender());
    transfer::share_object(voteRegistry);
}

public entry fun mint_user(name: String, icon_url: String, ctx: &mut TxContext)
{
    // Validate name length (3-100 characters)
    let name_length = name.length();
    assert!(name_length >= 3 && name_length <= 100, EInvalidNameLength);

    // Validate icon_url length (7-1000 characters)
    let icon_url_length = icon_url.length();
    assert!(icon_url_length >= 7 && icon_url_length <= 1000, EInvalidIconUrlLength);

    let user = create_user(name, icon_url, ctx);
    let inner_id = object::id(&user);
    event::emit(UserMinted{ user: inner_id, owner: ctx.sender() });
    transfer::transfer(user, ctx.sender());
}

public entry fun mint_user_vote(poll: Poll, poll_option: PollOption, user: User, voteRegistry: &mut VoteRegistry, ctx: &mut TxContext)
{
    // Check if the poll_option exists in poll's options
    let mut option_exists = false;
    let mut i = 0;
    let len = vector::length(&poll.options);
    
    while (i < len) 
    {
        let current_option = vector::borrow(&poll.options, i);
        if (object::id(current_option) == object::id(&poll_option)) 
        {
            option_exists = true;
            break
        };
        i = i + 1;
    };

    
    let inner_user_id = object::id(&user);
    let inner_poll_option_id = object::id(&poll_option);
    // Assert that the option exists in the poll
    assert!(option_exists, EInvalidPollOption);

    // Prevent double voting: ensure the user hasn't voted already
    /* let mut already_voted = false;
    let mut k = 0;
    let uv_len = vector::length(&voteRegistry.usersVoted);
    while (k < uv_len)
    {
        let seen_id_ref = vector::borrow(&voteRegistry.usersVoted, k);
        let seen_id = *seen_id_ref;
        if (seen_id == inner_user_id) 
        {
            already_voted = true;
            break;
        };
        k = k + 1;
    }; */
    assert!(!voteRegistry.usersVoted.contains(&inner_user_id), EAlreadyVoted);

    let user_vote = create_user_vote(poll, poll_option, user, ctx);
    let inner_vote_id = object::id(&user_vote);
    voteRegistry.usersVoted.push_back(inner_user_id);
    voteRegistry.votes.push_back(inner_poll_option_id);

    event::emit(UserVoteMinted{ user_vote: inner_vote_id, owner: ctx.sender() });
    transfer::transfer(user_vote, ctx.sender());
    //transfer::share_object(voteRegistry);
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
    let User { id, name: _, icon_url: _, wallet: _} = user;
    object::delete(id);
}

public fun check_is_valid(self: &Version) 
{
    assert!(self.version == VERSION, EInvalidPackageVersion);
}

public fun migrate(pub: &Publisher, version: &mut Version)
{
    assert!(version.version != VERSION, EVersionAlreadyUpdated);
    assert!(pub.from_package<Version>(), EInvalidPublisher);
    version.version = VERSION;
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) 
{
    init(ctx);
}