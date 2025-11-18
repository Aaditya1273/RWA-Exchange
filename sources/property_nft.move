/// Real World Asset (RWA) Property NFT Module
/// This module handles tokenization of real estate properties as NFTs
/// with fractional ownership and investment capabilities
module rwa_exchange::property_nft {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::coin::{Self, Coin};
    use one::oct::OCT;
    use one::balance::{Self, Balance};
    use one::event;
    use std::string::{Self, String};
    use std::vector;

    // ===== Error Codes =====
    const EInsufficientFunds: u64 = 1;
    const ENotOwner: u64 = 2;
    const EInvalidAmount: u64 = 3;
    const EPropertyNotActive: u64 = 4;
    const EInsufficientShares: u64 = 5;

    // ===== Structs =====

    /// Main Property NFT representing a real estate asset
    public struct PropertyNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        location: String,
        property_type: String,
        total_value: u64,
        total_shares: u64,
        available_shares: u64,
        price_per_share: u64,
        rental_yield: String,
        is_active: bool,
        owner: address,
        treasury: Balance<OCT>,
    }

    /// Investment record for tracking individual investments
    public struct Investment has key, store {
        id: UID,
        property_id: address,
        investor: address,
        shares_owned: u64,
        investment_amount: u64,
        timestamp: u64,
    }

    /// Capability for property management
    public struct PropertyCap has key, store {
        id: UID,
        property_id: address,
    }

    // ===== Events =====

    public struct PropertyCreated has copy, drop {
        property_id: address,
        name: String,
        total_value: u64,
        total_shares: u64,
        price_per_share: u64,
        owner: address,
    }

    public struct InvestmentMade has copy, drop {
        property_id: address,
        investor: address,
        shares_purchased: u64,
        amount_paid: u64,
        timestamp: u64,
    }

    public struct DividendDistributed has copy, drop {
        property_id: address,
        total_amount: u64,
        per_share_amount: u64,
    }

    // ===== Public Functions =====

    /// Create a new property NFT
    public entry fun create_property(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        location: vector<u8>,
        property_type: vector<u8>,
        total_value: u64,
        total_shares: u64,
        price_per_share: u64,
        rental_yield: vector<u8>,
        ctx: &mut TxContext
    ) {
        let property_id = object::new(ctx);
        let property_address = object::uid_to_address(&property_id);
        let owner = tx_context::sender(ctx);

        let property = PropertyNFT {
            id: property_id,
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
            location: string::utf8(location),
            property_type: string::utf8(property_type),
            total_value,
            total_shares,
            available_shares: total_shares,
            price_per_share,
            rental_yield: string::utf8(rental_yield),
            is_active: true,
            owner,
            treasury: balance::zero(),
        };

        let cap = PropertyCap {
            id: object::new(ctx),
            property_id: property_address,
        };

        // Emit property created event
        event::emit(PropertyCreated {
            property_id: property_address,
            name: string::utf8(name),
            total_value,
            total_shares,
            price_per_share,
            owner,
        });

        // Make property a shared object so anyone can invest
        transfer::share_object(property);
        
        // Transfer capability to owner
        transfer::transfer(cap, owner);
    }

    /// Invest in a property by purchasing shares
    public entry fun invest(
        property: &mut PropertyNFT,
        payment: Coin<OCT>,
        shares_to_buy: u64,
        ctx: &mut TxContext
    ) {
        assert!(property.is_active, EPropertyNotActive);
        assert!(shares_to_buy > 0, EInvalidAmount);
        assert!(property.available_shares >= shares_to_buy, EInsufficientShares);

        let required_amount = shares_to_buy * property.price_per_share;
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= required_amount, EInsufficientFunds);

        // Update property state
        property.available_shares = property.available_shares - shares_to_buy;
        
        // Add payment to treasury
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut property.treasury, payment_balance);

        let investor = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);

        // Create investment record
        let investment = Investment {
            id: object::new(ctx),
            property_id: object::uid_to_address(&property.id),
            investor,
            shares_owned: shares_to_buy,
            investment_amount: required_amount,
            timestamp,
        };

        // Emit investment event
        event::emit(InvestmentMade {
            property_id: object::uid_to_address(&property.id),
            investor,
            shares_purchased: shares_to_buy,
            amount_paid: required_amount,
            timestamp,
        });

        // Transfer investment record to investor
        transfer::transfer(investment, investor);
    }

    /// Distribute dividends to all investors (only property owner can call)
    public entry fun distribute_dividends(
        property: &mut PropertyNFT,
        _cap: &PropertyCap,
        dividend_amount: Coin<OCT>,
        ctx: &mut TxContext
    ) {
        assert!(property.owner == tx_context::sender(ctx), ENotOwner);
        
        let dividend_balance = coin::into_balance(dividend_amount);
        let total_dividend = balance::value(&dividend_balance);
        
        // Add to treasury for distribution
        balance::join(&mut property.treasury, dividend_balance);
        
        let sold_shares = property.total_shares - property.available_shares;
        let per_share_amount = if (sold_shares > 0) {
            total_dividend / sold_shares
        } else {
            0
        };

        // Emit dividend distribution event
        event::emit(DividendDistributed {
            property_id: object::uid_to_address(&property.id),
            total_amount: total_dividend,
            per_share_amount,
        });
    }

    /// Claim dividends for an investment
    public entry fun claim_dividends(
        property: &mut PropertyNFT,
        investment: &Investment,
        ctx: &mut TxContext
    ) {
        assert!(investment.investor == tx_context::sender(ctx), ENotOwner);
        
        // Calculate dividend amount based on shares owned
        let treasury_balance = balance::value(&property.treasury);
        let sold_shares = property.total_shares - property.available_shares;
        
        let dividend_amount = if (sold_shares > 0) {
            (treasury_balance * investment.shares_owned) / sold_shares
        } else {
            0
        };

        if (dividend_amount > 0) {
            let dividend_balance = balance::split(&mut property.treasury, dividend_amount);
            let dividend_coin = coin::from_balance(dividend_balance, ctx);
            transfer::public_transfer(dividend_coin, investment.investor);
        }
    }

    /// Update property status (only owner can call)
    public entry fun update_property_status(
        property: &mut PropertyNFT,
        _cap: &PropertyCap,
        is_active: bool,
        ctx: &mut TxContext
    ) {
        assert!(property.owner == tx_context::sender(ctx), ENotOwner);
        property.is_active = is_active;
    }

    // ===== Secondary Trading Functions =====

    /// Transfer investment shares to another address
    public entry fun transfer_investment(
        investment: Investment,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        // Simply transfer the Investment object to the new owner
        // The Investment object represents ownership of shares
        transfer::transfer(investment, recipient);
    }

    /// List investment for sale (creates a listing)
    public entry fun list_investment_for_sale(
        investment: &Investment,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(investment.investor == tx_context::sender(ctx), ENotOwner);
        
        // Emit listing event
        event::emit(InvestmentListed {
            investment_id: object::uid_to_address(&investment.id),
            seller: investment.investor,
            shares: investment.shares_owned,
            asking_price: price,
        });
    }

    /// Buy listed investment shares
    public entry fun buy_listed_investment(
        investment: Investment,
        payment: Coin<OCT>,
        seller: address,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let payment_amount = coin::value(&payment);
        
        // Extract investment data before moving
        let investment_id = object::uid_to_address(&investment.id);
        let shares = investment.shares_owned;
        
        // Transfer payment to seller
        transfer::public_transfer(payment, seller);
        
        // Transfer investment to buyer
        transfer::transfer(investment, buyer);
        
        // Emit trade event
        event::emit(InvestmentTraded {
            investment_id,
            seller,
            buyer,
            shares,
            price: payment_amount,
        });
    }

    // ===== Events for Secondary Trading =====

    public struct InvestmentListed has copy, drop {
        investment_id: address,
        seller: address,
        shares: u64,
        asking_price: u64,
    }

    public struct InvestmentTraded has copy, drop {
        investment_id: address,
        seller: address,
        buyer: address,
        shares: u64,
        price: u64,
    }

    // ===== View Functions =====

    /// Get property details
    public fun get_property_info(property: &PropertyNFT): (
        String, String, String, String, String, u64, u64, u64, u64, String, bool, address
    ) {
        (
            property.name,
            property.description,
            property.image_url,
            property.location,
            property.property_type,
            property.total_value,
            property.total_shares,
            property.available_shares,
            property.price_per_share,
            property.rental_yield,
            property.is_active,
            property.owner
        )
    }

    /// Get investment details
    public fun get_investment_info(investment: &Investment): (address, address, u64, u64, u64) {
        (
            investment.property_id,
            investment.investor,
            investment.shares_owned,
            investment.investment_amount,
            investment.timestamp
        )
    }

    /// Get treasury balance
    public fun get_treasury_balance(property: &PropertyNFT): u64 {
        balance::value(&property.treasury)
    }
}