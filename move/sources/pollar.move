
module pollarapp::pollar;

use sui::package::Publisher;
use sui::object::{Self, ID, UID}; 
use sui::event;
use sui::transfer;
use std::option::{Self, Option};
use std::string::String;
use std::vector;
use sui::dynamic_field as df;
use sui::bcs;

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
const ENftRequired: u64 = 15; // NFT required but not provided
const ENftNotOwned: u64 = 16; // NFT not owned by voter
const ENftTypeMismatch: u64 = 17; // NFT type doesn't match poll's required collection
const EDecryptionFailed: u64 = 18; // Failed to decrypt vote
const EInvalidEncryptedVote: u64 = 19; // Invalid encrypted vote data
const ESealAccessDenied: u64 = 20; // Seal access denied
const EInvalidVotePower: u64 = 21; // Vote power must be positive

const VERSION: u64 = 3; // Incremented version for Seal encryption support

// Seal package ID - Testnet
// Mainnet: 0xa212c4c6c7183b911d0be8768f4cb1df7a383025b5d0ba0c014009f0f30f5f8d
const SEAL_PACKAGE_ID: address = @0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682;

// Version object used to track package migration and current schema version.
// Stored as a shared object so migrations can verify and update package state.
public struct Version has key 
{
    id: UID,
    version: u64
}

// VoteRegistry holds voting state for a single Poll.
// It references the Poll ID, tracks which wallet addresses have voted,
// and keeps per-option vote counts for simple tallying.
public struct VoteRegistry has key 
{
    id: UID,
    poll_id: ID,
    usersVoted: vector<address>, // Now using addresses to track voters; simplified
    option_votes: vector<u64>, // Vote counts per option (for simple voting)
    encrypted_votes: vector<EncryptedVote>, // Encrypted votes for privacy
    is_sealed: bool, // Whether votes are encrypted (sealed) or not
}

// EncryptedVote stores a Seal-encrypted vote
// The encrypted data contains the option_index (u64) as bytes
public struct EncryptedVote has store
{
    encrypted_data: vector<u8>, // BCS-serialized encrypted object from Seal
    voter: address, // Voter address (for tracking who voted, but not what they voted)
}

// PollRegistry is a shared object that acts as a registry for polls.
// Dynamic fields map Poll IDs to their corresponding VoteRegistry IDs.
public struct PollRegistry has key 
{
    id: UID,
}

// User represents a participant profile with a name, optional icon URL,
// and the wallet address that owns the profile.
public struct User has key, store 
{
    id: UID,
    name: String,
    icon_url: String,
    wallet: address,
}

// Event payload emitted when a User is minted/created. Contains the User ID
// and the owner address that received the minted object.
public struct UserMinted has copy, drop
{
    user: ID,
    owner: address
}

// Poll holds metadata for a poll: title, description, media, date strings,
// and the list of PollOption objects available for voting.
// Poll is a shared object so anyone can read it and vote on it.
public struct Poll has key 
{
    id: UID,
    name: String,
    description: String,
    image_url: String,
    start_date: String,
    end_date: String,
    options: vector<PollOption>,
    creator: address, // Address of the poll creator
    nft_collection_type: String, // NFT collection type (e.g., "0x...::popkins_nft::Popkins"). Empty string means no NFT required.
    is_private: bool, // If true, only NFT holders can see this poll. If false, everyone can see it.
}

// Event payload emitted when a Poll is minted. Contains the Poll ID and the
// owner address that received the minted Poll object.
public struct PollMinted has copy, drop
{
    poll: ID,
    owner: address
}

// PollOption represents a single selectable option within a Poll.
// Each option has its own UID and optional image metadata.
public struct PollOption has key, store 
{
    id: UID,
    name: String,
    image_url: String
}

// UserVote is a legacy object representing a user's vote, retained for
// backwards compatibility. Since Poll is now shared, we store poll_id instead of Poll.
public struct UserVote has key, store 
{
    id: UID,
    user: User,
    poll_id: ID, // Changed from Poll to ID since Poll is now shared
    poll_option: PollOption
}

// Event payload emitted when a UserVote is minted. Contains the UserVote ID
// and the owner address that received the minted UserVote object.
public struct UserVoteMinted has copy, drop
{
    user_vote: ID,
    owner: address
}

#[test_only]
public fun share_poll_for_tests(poll: Poll)
{
    transfer::share_object(poll);
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

public fun create_poll(name: String, description: String, image_url: String, start_date: String, end_date: String, options: vector<PollOption>, nft_collection_type: String, is_private: bool, ctx: &mut TxContext): Poll
{
    let poll = Poll 
    {
        id: object::new(ctx),
        name,
        description,
        image_url,
        start_date,
        end_date,
        options,
        creator: ctx.sender(), // Store creator address
        nft_collection_type, // NFT collection type (empty string = no NFT required)
        is_private, // Visibility: true = private (only NFT holders can see), false = public (everyone can see)
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

public entry fun mint_poll(name: String, description: String, image_url: String, start_date: String, end_date: String, options: vector<PollOption>, nft_collection_type: String, is_private: bool, pollRegistry: &mut PollRegistry, ctx: &mut TxContext)
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

    // Validate: if poll is private, it must require NFT
    // Private polls without NFT requirement don't make sense
    if (is_private) {
        assert!(nft_collection_type.length() > 0, EInvalidPollOption);
    };

    // Note: Date range validation removed - Move doesn't support String comparison
    // Date validation should be done on the frontend

    let poll = create_poll(name, description, image_url, start_date, end_date, options, nft_collection_type, is_private, ctx);
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
        encrypted_votes: vector::empty(),
        is_sealed: true, // Default to sealed (encrypted) voting
    };

    df::add(&mut pollRegistry.id, inner_id, object::id(&voteRegistry));
    event::emit(PollMinted{ poll: inner_id, owner: ctx.sender() });
    
    // Make Poll a shared object so anyone can read it and vote on it
    transfer::share_object(poll);
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

// SEAL ENCRYPTION FUNCTIONS
// seal_approve function for Seal access control
// This function is called by Seal key servers to verify access to decrypt votes
// The identity is the poll_id (as bytes) - only voters who voted on this poll can decrypt
entry fun seal_approve(
    id: vector<u8>, // Poll ID as bytes (identity for Seal)
    poll: &Poll,
    voteRegistry: &VoteRegistry,
    ctx: &TxContext
) {
    let poll_id = object::id(poll);
    let poll_id_bytes = bcs::to_bytes(&poll_id);
    
    // Verify the identity matches the poll ID
    assert!(poll_id_bytes == id, ESealAccessDenied);
    
    // Verify the VoteRegistry belongs to this Poll
    assert!(voteRegistry.poll_id == poll_id, EInvalidVoteRegistry);
    
    // Verify the voter has voted (they are in usersVoted list)
    let voter = ctx.sender();
    let mut has_voted = false;
    let mut i = 0;
    let voters_len = vector::length(&voteRegistry.usersVoted);
    while (i < voters_len) {
        let voter_addr = *vector::borrow(&voteRegistry.usersVoted, i);
        if (voter_addr == voter) {
            has_voted = true;
            break
        };
        i = i + 1;
    };
    assert!(has_voted, ESealAccessDenied);
}

// Vote with encrypted data (Seal-encrypted)
// The encrypted_data is a BCS-serialized Seal encrypted object
// option_index is needed to update option_votes for vote counting
public entry fun vote_sealed(
    poll: &Poll,
    option_index: u64, // Option index for vote counting (also encrypted in encrypted_data)
    vote_power: u64, // Dynamic vote weight (>=1)
    encrypted_data: vector<u8>, // BCS-serialized Seal encrypted object
    voteRegistry: &mut VoteRegistry,
    ctx: &mut TxContext
) {
    let voter = ctx.sender();
    let poll_id = object::id(poll);
    
    // Check the VoteRegistry belongs to this Poll
    assert!(voteRegistry.poll_id == poll_id, EInvalidVoteRegistry);
    
    // Verify the poll is sealed
    assert!(voteRegistry.is_sealed, EInvalidEncryptedVote);
    
    // Validate option index
    let options_len = vector::length(&poll.options);
    assert!(option_index < options_len, EInvalidOptionIndex);
    assert!(vote_power > 0, EInvalidVotePower);
    
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
    
    // Create encrypted vote
    let encrypted_vote = EncryptedVote {
        encrypted_data,
        voter,
    };
    
    // Add encrypted vote to registry
    vector::push_back(&mut voteRegistry.encrypted_votes, encrypted_vote);
    
    // Update option_votes for vote counting (while keeping votes encrypted)
    let mut new_option_votes = vector::empty();
    let mut i = 0;
    let votes_len = vector::length(&voteRegistry.option_votes);
    while (i < votes_len) {
        if (i == option_index) {
            let current_votes = *vector::borrow(&voteRegistry.option_votes, i);
            vector::push_back(&mut new_option_votes, current_votes + vote_power);
        } else {
            let votes = *vector::borrow(&voteRegistry.option_votes, i);
            vector::push_back(&mut new_option_votes, votes);
        };
        i = i + 1;
    };
    voteRegistry.option_votes = new_option_votes;
    
    // Append the voter's address (for tracking who voted)
    vector::push_back(&mut voteRegistry.usersVoted, voter);
    
    // Emit event
    event::emit(UserVoteMinted{ user_vote: poll_id, owner: voter });
}

// Vote with encrypted data and NFT (Seal-encrypted)
// option_index is needed to update option_votes for vote counting
public entry fun vote_sealed_with_nft<T: key + store>(
    poll: &Poll,
    option_index: u64, // Option index for vote counting (also encrypted in encrypted_data)
    vote_power: u64, // Dynamic vote weight (>=1)
    encrypted_data: vector<u8>, // BCS-serialized Seal encrypted object
    voteRegistry: &mut VoteRegistry,
    nft: &T, // NFT object - ownership verified by Sui runtime
    ctx: &mut TxContext
) {
    let voter = ctx.sender();
    let poll_id = object::id(poll);
    
    // Check if poll requires NFT
    let requires_nft = poll.nft_collection_type.length() > 0;
    assert!(requires_nft, ENftRequired);
    
    // Check the VoteRegistry belongs to this Poll
    assert!(voteRegistry.poll_id == poll_id, EInvalidVoteRegistry);
    
    // Verify the poll is sealed
    assert!(voteRegistry.is_sealed, EInvalidEncryptedVote);
    
    // Validate option index
    let options_len = vector::length(&poll.options);
    assert!(option_index < options_len, EInvalidOptionIndex);
    assert!(vote_power > 0, EInvalidVotePower);
    
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
    
    // NFT ownership is verified by Sui runtime
    
    // Create encrypted vote
    let encrypted_vote = EncryptedVote {
        encrypted_data,
        voter,
    };
    
    // Add encrypted vote to registry
    vector::push_back(&mut voteRegistry.encrypted_votes, encrypted_vote);
    
    // Update option_votes for vote counting (while keeping votes encrypted)
    let mut new_option_votes = vector::empty();
    let mut i = 0;
    let votes_len = vector::length(&voteRegistry.option_votes);
    while (i < votes_len) {
        if (i == option_index) {
            let current_votes = *vector::borrow(&voteRegistry.option_votes, i);
            vector::push_back(&mut new_option_votes, current_votes + vote_power);
        } else {
            let votes = *vector::borrow(&voteRegistry.option_votes, i);
            vector::push_back(&mut new_option_votes, votes);
        };
        i = i + 1;
    };
    voteRegistry.option_votes = new_option_votes;
    
    // Append the voter's address (for tracking who voted)
    vector::push_back(&mut voteRegistry.usersVoted, voter);
    
    // Emit event
    event::emit(UserVoteMinted{ user_vote: poll_id, owner: voter });
}

// Note: Poll is now a shared object, so it cannot be deleted.
// Shared objects in Sui are permanent and cannot be deleted.
// If you need to mark a poll as closed, consider adding a 'closed' or 'active' field to the Poll struct.
// This function is kept for backward compatibility but will not work with shared Poll objects.
// public entry fun delete_poll(poll: Poll, ctx: &mut TxContext)
// {
//     let Poll { id, name: _, description: _, image_url: _, start_date: _, end_date: _, options: mut options, creator: _ } = poll;
//     while (!vector::is_empty(&options)) 
//     {
//         let pollOption = vector::pop_back(&mut options);
//         let PollOption { id: pid, name: _, image_url: _ } = pollOption;
//         object::delete(pid);
//     };
//     vector::destroy_empty(options);
//     object::delete(id);
// }

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

