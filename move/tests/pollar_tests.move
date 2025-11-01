 #[test_only]
module pollarapp::pollar_tests {
    use sui::object::{Self, UID};
    use sui::test_scenario::{Self, Scenario};
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use std::vector;
    use pollarapp::pollar::{Self, User, Poll, PollOption, PollRegistry, Version};

    const USER_ADDRESS: address = @0x0;
    const USER2_ADDRESS: address = @0x1;

    // Helper function to create test user and poll
    #[test_only]
    fun setup_test(ctx: &mut TxContext): (User, Poll) {
        let test_user = pollar::create_user(
            string::utf8(b"Test User"),
            string::utf8(b"http://example.com/user.jpg"),
            ctx
        );

        let mut options = vector::empty<PollOption>();
        let mut option1 = pollar::create_poll_option(
            string::utf8(b"Option 1"),
            string::utf8(b"http://example.com/image1.jpg"),
            ctx
        );
        let option2 = pollar::create_poll_option(
            string::utf8(b"Option 2"),
            string::utf8(b"http://example.com/image2.jpg"),
            ctx
        );
        
        vector::push_back(&mut options, option1);
        vector::push_back(&mut options, option2);

        let test_poll = pollar::create_poll(
            string::utf8(b"Test Poll"),
            string::utf8(b"Test Description"),
            string::utf8(b"http://example.com/poll.jpg"),
            string::utf8(b"2025-11-01"),
            string::utf8(b"2025-12-01"),
            options,
            ctx
        );

        (test_user, test_poll)
    }

  

    // Test delete_poll function
    #[test]
    fun test_delete_poll() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        let ctx = test_scenario::ctx( &mut scenario);
        
        let (user, poll) = setup_test(ctx);
        pollar::delete_user(user, ctx);
        pollar::delete_poll(poll, ctx);
        
        test_scenario::end(scenario);
    }

    // Test delete_user function
    #[test]
    fun test_delete_user() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let (user, poll) = setup_test(ctx);
        pollar::delete_user(user, ctx);
        pollar::delete_poll(poll, ctx);
        
        test_scenario::end(scenario);
    }



    // Test init_for_testing function - creates PollRegistry and Version as shared objects
    #[test]
    fun test_init() {
        let sender = USER_ADDRESS;
        let mut scenario = test_scenario::begin(sender);
        
        pollar::init_for_testing(scenario.ctx());
        
        scenario.next_tx(sender);
        let poll_registry = scenario.take_shared<PollRegistry>();
        test_scenario::return_shared(poll_registry);
        
        scenario.next_tx(sender);
        let version = scenario.take_shared<Version>();
        test_scenario::return_shared(version);
        
        scenario.end();
    }

    // Test for mint_poll function - creates PollRegistry, polls, and options
    #[test]
    fun test_mint_poll() {
        let sender = USER_ADDRESS;
        let mut scenario = test_scenario::begin(sender);
        
        pollar::init_for_testing(scenario.ctx());
        
        scenario.next_tx(sender);
        let mut poll_registry = scenario.take_shared<PollRegistry>();
        
        let mut options = vector::empty();
        vector::push_back(&mut options, pollar::create_poll_option(
            string::utf8(b"Option 1"),
            string::utf8(b"http://example.com/image1.jpg"),
            scenario.ctx()
        ));
        vector::push_back(&mut options, pollar::create_poll_option(
            string::utf8(b"Option 2"),
            string::utf8(b"http://example.com/image2.jpg"),
            scenario.ctx()
        ));
        
        pollar::mint_poll(
            string::utf8(b"Test Poll"),
            string::utf8(b"Test Description"),
            string::utf8(b"http://example.com/poll.jpg"),
            string::utf8(b"2025-11-01"),
            string::utf8(b"2025-12-01"),
            options,
            &mut poll_registry,
            scenario.ctx()
        );
        
        test_scenario::return_shared(poll_registry);
        scenario.end();
    }

    // Test mint_user function
    #[test]
    fun test_mint_user() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            pollar::mint_user(
                string::utf8(b"Test User"),
                string::utf8(b"http://example.com/user.jpg"),
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
            let user = pollar::create_user(
                string::utf8(b"Test User"),
                string::utf8(b"http://example.com/user.jpg"),
                ctx
            );
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
            let mut options = vector::empty<PollOption>();
            vector::push_back(&mut options, pollar::create_poll_option(
                string::utf8(b"Option 1"),
                string::utf8(b"http://example.com/image1.jpg"),
                ctx
            ));
            vector::push_back(&mut options, pollar::create_poll_option(
                string::utf8(b"Option 2"),
                string::utf8(b"http://example.com/image2.jpg"),
                ctx
            ));

            let created_poll = pollar::create_poll(
                string::utf8(b"Test Poll"),
                string::utf8(b"Test Description"),
                string::utf8(b"http://example.com/poll.jpg"),
                string::utf8(b"2025-11-01"),
                string::utf8(b"2025-12-01"),
                options,
                ctx
            );

            pollar::delete_poll(created_poll, ctx);
        };
        test_scenario::end(scenario);
    }
}  