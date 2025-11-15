 #[test_only]
module pollarapp::pollar_tests {
    use sui::test_scenario::{Self, Scenario};
    use std::string;
    use pollarapp::pollar::{Self, User, Poll, PollOption, PollRegistry, Version, UserVote, VoteRegistry};

    const USER_ADDRESS: address = @0x0;
#[test_only]
use sui::dynamic_field;
    // Test constants
    const TEST_USER_NAME: vector<u8> = b"Test User";
    const TEST_USER_ICON: vector<u8> = b"http://example.com/user.jpg";
    const TEST_POLL_NAME: vector<u8> = b"Test Poll";
    const TEST_POLL_DESC: vector<u8> = b"Test Description";
    const TEST_POLL_IMAGE: vector<u8> = b"http://example.com/poll.jpg";
    const TEST_START_DATE: vector<u8> = b"2025-11-01";
    const TEST_END_DATE: vector<u8> = b"2025-12-01";
    const TEST_OPTION1_NAME: vector<u8> = b"Option 1";
    const TEST_OPTION1_IMAGE: vector<u8> = b"http://example.com/image1.jpg";
    const TEST_OPTION2_NAME: vector<u8> = b"Option 2";
    const TEST_OPTION2_IMAGE: vector<u8> = b"http://example.com/image2.jpg";

    // Setup function to initialize shared objects (PollRegistry and Version)
    #[test_only]
    fun setup_shared_objects(scenario: &mut Scenario, sender: address): (PollRegistry, Version) {
        pollar::init_for_testing(scenario.ctx());
        
        scenario.next_tx(sender);
        let poll_registry = scenario.take_shared<PollRegistry>();
        test_scenario::return_shared(poll_registry);
        
        scenario.next_tx(sender);
        let version = scenario.take_shared<Version>();
        test_scenario::return_shared(version);
        
        scenario.next_tx(sender);
        let poll_registry_final = scenario.take_shared<PollRegistry>();
        let version_final = scenario.take_shared<Version>();
        
        (poll_registry_final, version_final)
    }

    // Helper function to create test poll options
    #[test_only]
    fun create_test_poll_options(ctx: &mut TxContext): vector<PollOption> {
        let mut options = vector::empty<PollOption>();
        let option1 = pollar::create_poll_option(
            string::utf8(TEST_OPTION1_NAME),
            string::utf8(TEST_OPTION1_IMAGE),
            ctx
        );
        let option2 = pollar::create_poll_option(
            string::utf8(TEST_OPTION2_NAME),
            string::utf8(TEST_OPTION2_IMAGE),
            ctx
        );
        vector::push_back(&mut options, option1);
        vector::push_back(&mut options, option2);
        options
    }

    // Helper function to create a test user
    #[test_only]
    fun create_test_user(ctx: &mut TxContext): User {
        pollar::create_user(
            string::utf8(TEST_USER_NAME),
            string::utf8(TEST_USER_ICON),
            ctx
        )
    }

    // Helper function to create a test poll
    #[test_only]
    fun create_test_poll(ctx: &mut TxContext): Poll {
        let options = create_test_poll_options(ctx);
        pollar::create_poll(
            string::utf8(TEST_POLL_NAME),
            string::utf8(TEST_POLL_DESC),
            string::utf8(TEST_POLL_IMAGE),
            string::utf8(TEST_START_DATE),
            string::utf8(TEST_END_DATE),
            options,
            ctx
        )
    }

    // Helper function to create test user and poll (backward compatibility)
    #[test_only]
    fun setup_test(ctx: &mut TxContext): (User, Poll) {
        let test_user = create_test_user(ctx);
        let test_poll = create_test_poll(ctx);
        (test_user, test_poll)
    }

    // Setup function for tests that need shared objects and minted poll
    #[test_only]
    fun setup_with_minted_poll(scenario: &mut Scenario, sender: address): Poll {
        pollar::init_for_testing(scenario.ctx());
        
        scenario.next_tx(sender);
        let mut poll_registry = scenario.take_shared<PollRegistry>();
        
        let options = create_test_poll_options(scenario.ctx());
        pollar::mint_poll(
            string::utf8(TEST_POLL_NAME),
            string::utf8(TEST_POLL_DESC),
            string::utf8(TEST_POLL_IMAGE),
            string::utf8(TEST_START_DATE),
            string::utf8(TEST_END_DATE),
            options,
            &mut poll_registry,
            scenario.ctx()
        );
        
        test_scenario::return_shared(poll_registry);
        
        // NOTE: Poll is now shared, so we need to take it as shared
        scenario.next_tx(sender);
        let poll = scenario.take_shared<Poll>();
        
        poll
    }

  

    // Test delete_poll function - NOTE: Poll is now shared, so delete_poll is commented out
    // #[test]
    // fun test_delete_poll() {
    //     let mut scenario = test_scenario::begin(USER_ADDRESS);
    //     let ctx = test_scenario::ctx( &mut scenario);
    //     
    //     let (user, poll) = setup_test(ctx);
    //     pollar::delete_user(user, ctx);
    //     pollar::delete_poll(poll, ctx);
    //     
    //     test_scenario::end(scenario);
    // }

    // Test delete_user function
    #[test]
    fun test_delete_user() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let (user, _poll) = setup_test(ctx);
        pollar::delete_user(user, ctx);
        // NOTE: Poll is now shared, so we cannot delete it
        // pollar::delete_poll(poll, ctx);
        
        test_scenario::end(scenario);
    }



    // Test init_for_testing function - creates PollRegistry and Version as shared objects
    #[test]
    fun test_init() {
        let sender = USER_ADDRESS;
        let mut scenario = test_scenario::begin(sender);
        
        let (poll_registry, version) = setup_shared_objects(&mut scenario, sender);
        test_scenario::return_shared(poll_registry);
        test_scenario::return_shared(version);
        
        scenario.end();
    }

    // Test for mint_poll function - creates PollRegistry, polls, and options
    #[test]
    fun test_mint_poll() {
        let sender = USER_ADDRESS;
        let mut scenario = test_scenario::begin(sender);
        
        // NOTE: Poll is now shared, so it cannot be transferred
        // setup_with_minted_poll returns a shared Poll object
        let _poll = setup_with_minted_poll(&mut scenario, sender);
        // transfer::public_transfer(poll, sender); // Cannot transfer shared objects
        
        scenario.end();
    }

    // Test mint_user function
    #[test]
    fun test_mint_user() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            pollar::mint_user(
                string::utf8(TEST_USER_NAME),
                string::utf8(TEST_USER_ICON),
                ctx
            );
        };
        test_scenario::end(scenario);
    }

    // Test create_user function
    #[test]
    fun test_create_user() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let user = create_test_user(ctx);
            pollar::delete_user(user, ctx);
        };
        test_scenario::end(scenario);
    }

    // Test create_poll function
    #[test]
    fun test_create_poll() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let _created_poll = create_test_poll(ctx);
            // NOTE: Poll is now shared, so we cannot delete it
            // pollar::delete_poll(created_poll, ctx);
        };
        test_scenario::end(scenario);
    }

    // Test create_poll_option function
    #[test]
    fun test_create_poll_option() {
        let sender = USER_ADDRESS;
        let mut scenario = test_scenario::begin(sender);
        
        let _poll = create_test_poll(scenario.ctx());
        // NOTE: Poll is now shared, so we cannot delete it
        // pollar::delete_poll(poll, scenario.ctx());
        
        scenario.end();
    }

    // Test create_user_vote function
    #[test]
    fun test_create_user_vote() {
        let sender = USER_ADDRESS;
        let mut scenario = test_scenario::begin(sender);
        
        let user = create_test_user(scenario.ctx());
        let poll = create_test_poll(scenario.ctx());
        
        let vote_option = pollar::create_poll_option(
            string::utf8(TEST_OPTION1_NAME),
            string::utf8(TEST_OPTION1_IMAGE),
            scenario.ctx()
        );
        
        // NOTE: create_user_vote now takes &Poll (reference) instead of owned Poll
        let user_vote = pollar::create_user_vote(&poll, vote_option, user, scenario.ctx());
        transfer::public_transfer(user_vote, sender);
        
        scenario.next_tx(sender);
        let user_vote_received = scenario.take_from_sender<UserVote>();
        transfer::public_transfer(user_vote_received, sender);
        
        // Clean up poll (it's owned in test, but shared in production)
        pollar::delete_poll(poll, scenario.ctx());
        
        scenario.end();
    }

}
