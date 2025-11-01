 #[test_only]
module pollarapp::pollar_tests {
    use sui::object::{Self, UID};
    use sui::test_scenario::{Self, Scenario};
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use std::vector;
    use pollarapp::pollar::{Self, User, Poll, PollOption};

    const USER_ADDRESS: address = @0x0;
    const USER2_ADDRESS: address = @0x1;

    #[test_only]
    fun setup_test(ctx: &mut TxContext): (User, Poll) {
        // Test için bir user oluştur
        let test_user = pollar::create_user(
            string::utf8(b"Test User"),
            string::utf8(b"http://example.com/user.jpg"),
            ctx
        );

        // Test için poll options oluştur
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

        // Test için poll oluştur
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

  

#[test]
fun test_delete_poll() {
    let mut scenario = test_scenario::begin(USER_ADDRESS);
    let ctx = test_scenario::ctx( &mut scenario);
    
    // Her iki değeri de kullan
    let (user, poll) = setup_test(ctx);
    
    // Önce user'ı sil
    pollar::delete_user(user, ctx);
    // Sonra poll'u sil
    pollar::delete_poll(poll, ctx);
    
    test_scenario::end(scenario);
}

#[test]
fun test_delete_user() {
    let mut scenario = test_scenario::begin(USER_ADDRESS);
    let ctx = test_scenario::ctx(&mut scenario);
    
    // Her iki değeri de kullan
    let (user, poll) = setup_test(ctx);
    
    // Önce user'ı sil
    pollar::delete_user(user, ctx);
    // Sonra poll'u sil
    pollar::delete_poll(poll, ctx);
    
    test_scenario::end(scenario);
}



    #[test]
    fun test_mint_poll() {
        let mut scenario = test_scenario::begin(USER_ADDRESS);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let mut options = vector::empty();
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
            
            pollar::mint_poll(
                string::utf8(b"Test Poll"),
                string::utf8(b"Test Description"),
                string::utf8(b"http://example.com/poll.jpg"),
                string::utf8(b"2025-11-01"),
                string::utf8(b"2025-12-01"),
                options,
                ctx
            );
        };
        test_scenario::end(scenario);
    }

    #[test]
fun test_mint_user() {
    let mut scenario = test_scenario::begin(USER_ADDRESS);
    {
        let ctx = test_scenario::ctx(&mut scenario);
        // mint_user signature in sources: (name, icon_url, ctx)
        pollar::mint_user(
            string::utf8(b"Test User"),
            string::utf8(b"http://example.com/user.jpg"),
            ctx
        );
    };
    test_scenario::end(scenario);
}
}  