
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
const EInvalidOptionsLength: u64 = 7;
const EAlreadyVoted: u64 = 8;
const EInvalidVoteRegistry: u64 = 9;
const EInvalidUserWallet: u64 = 10;
const EPollNotStarted: u64 = 11;
const EPollEnded: u64 = 12;
const EInvalidDateRange: u64 = 13;
const EInvalidOptionIndex: u64 = 14; // For simple voting use-case

const VERSION: u64 = 1;

public struct Version has key 
{
    id: UID,
    version: u64
}

public struct VoteRegistry has key 
{
    id: UID,
    poll_id: ID,
    usersVoted: vector<address>, // Now using addresses to track voters; simplified
    option_votes: vector<u64>, // Vote counts per option (for simple voting)
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
        id: object::new(ctx),
        name,
        image_url
    };
    pollOption
}

public fun create_poll(name: String, description: String, image_url: String, start_date: String, end_date: String, options: vector<PollOption>, ctx: &mut TxContext): Poll
{
    let poll = Poll 
    {
        id: object::new(ctx),
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
        id: object::new(ctx),
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
        id: object::new(ctx),
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

    // Note: Date range validation removed - Move doesn't support String comparison
    // Date validation should be done on the frontend

    let poll = create_poll(name, description, image_url, start_date, end_date, options, ctx);
    let inner_id = object::id(&poll);
    
    // Simplified VoteRegistry - now uses address list and option_votes
    let options_len = vector::length(&poll.options);
    let mut option_votes = vector::empty();
    let mut i = 0;
    while (i < options_len) {
        vector::push_back(&mut option_votes, 0);
        i = i + 1;
    };
    
    let voteRegistry = VoteRegistry 
    {
        id: object::new(ctx),
        poll_id: inner_id,
        usersVoted: vector::empty(),
        option_votes,
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

    // SIMPLE VOTING FUNCTION - uses only option_index (no User or PollOption objects)
public entry fun vote(
    poll: &Poll,
    option_index: u64,
    voteRegistry: &mut VoteRegistry,
    ctx: &mut TxContext
) {
    let voter = ctx.sender();
    let poll_id = object::id(poll);
    
    // Check the VoteRegistry belongs to this Poll
    assert!(voteRegistry.poll_id == poll_id, EInvalidVoteRegistry);
    
    // Validate option index
    let options_len = vector::length(&poll.options);
    assert!(option_index < options_len, EInvalidOptionIndex);
    
    // Check for double voting by wallet address
    let mut already_voted = false;
    let mut j = 0;
    let voters_len = vector::length(&voteRegistry.usersVoted);
    while (j < voters_len) {
        let voter_addr = *vector::borrow(&voteRegistry.usersVoted, j);
        if (voter_addr == voter) {
            already_voted = true;
            break
        };
        j = j + 1;
    };
    assert!(!already_voted, EAlreadyVoted);
    
    // Add the vote - update the option_votes vector
    let mut new_option_votes = vector::empty();
    let mut i = 0;
    let votes_len = vector::length(&voteRegistry.option_votes);
    while (i < votes_len) {
        if (i == option_index) {
            let current_votes = *vector::borrow(&voteRegistry.option_votes, i);
            vector::push_back(&mut new_option_votes, current_votes + 1);
        } else {
            let votes = *vector::borrow(&voteRegistry.option_votes, i);
            vector::push_back(&mut new_option_votes, votes);
        };
        i = i + 1;
    };
    voteRegistry.option_votes = new_option_votes;
    
    // Append the voter's address
    vector::push_back(&mut voteRegistry.usersVoted, voter);
    
    // Emit event
    event::emit(UserVoteMinted{ user_vote: poll_id, owner: voter }); // Basit event
}

// Eski karmaşık oy verme fonksiyonu - geriye dönük uyumluluk için korundu
public entry fun mint_user_vote(poll: Poll, poll_option: PollOption, user: User, voteRegistry: &mut VoteRegistry, ctx: &mut TxContext)
{
    let poll_id = object::id(&poll);
    let inner_user_id = object::id(&user);
    let inner_poll_option_id = object::id(&poll_option);

    // 1. Verify the VoteRegistry belongs to this Poll
    assert!(voteRegistry.poll_id == poll_id, EInvalidVoteRegistry);

    // 2. Ensure the User's wallet address matches the transaction sender
    assert!(user.wallet == ctx.sender(), EInvalidUserWallet);

    // 3. Verify the PollOption exists in the Poll's options list
    let mut option_exists = false;
    let mut i = 0;
    let len = vector::length(&poll.options);
    
    while (i < len) 
    {
        let current_option = vector::borrow(&poll.options, i);
        if (object::id(current_option) == inner_poll_option_id) 
        {
            option_exists = true;
            break
        };
        i = i + 1;
    };
    assert!(option_exists, EInvalidPollOption);

    // 4. Check whether the user has already voted (by wallet address)
    let voter = ctx.sender();
    let mut already_voted = false;
    let mut j = 0;
    let voters_len = vector::length(&voteRegistry.usersVoted);
    while (j < voters_len) {
        let voter_addr = *vector::borrow(&voteRegistry.usersVoted, j);
        if (voter_addr == voter) {
            already_voted = true;
            break
        };
        j = j + 1;
    };
    assert!(!already_voted, EAlreadyVoted);

    // 5. Find the option index for the provided PollOption
    let mut option_index = 0;
    let mut k = 0;
    while (k < len) {
        let current_option = vector::borrow(&poll.options, k);
        if (object::id(current_option) == inner_poll_option_id) {
            option_index = k;
            break
        };
        k = k + 1;
    };

    // 6. Add the vote - update option_votes vector
    let mut new_option_votes = vector::empty();
    let mut i2 = 0;
    let votes_len = vector::length(&voteRegistry.option_votes);
    while (i2 < votes_len) {
        if (i2 == option_index) {
            let current_votes = *vector::borrow(&voteRegistry.option_votes, i2);
            vector::push_back(&mut new_option_votes, current_votes + 1);
        } else {
            let votes = *vector::borrow(&voteRegistry.option_votes, i2);
            vector::push_back(&mut new_option_votes, votes);
        };
        i2 = i2 + 1;
    };
    voteRegistry.option_votes = new_option_votes;

    // 7. Append the voter's address to the registry
    vector::push_back(&mut voteRegistry.usersVoted, voter);

    // 8. Create a UserVote object (legacy structure for compatibility)
    let user_vote = create_user_vote(poll, poll_option, user, ctx);
    let inner_vote_id = object::id(&user_vote);

    event::emit(UserVoteMinted{ user_vote: inner_vote_id, owner: ctx.sender() });
    transfer::transfer(user_vote, ctx.sender());
}

public entry fun delete_poll(poll: Poll, ctx: &mut TxContext)
{
    let Poll { id, name: _, description: _, image_url: _, start_date: _, end_date: _, options: mut options } = poll;
    while (!vector::is_empty(&options)) 
    {
        let pollOption = vector::pop_back(&mut options);
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

