// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface internal priceFeed;

    /**
     * Aggregator: ETH/USD
     * Mainnet Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
     * sepolia Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
     */
    constructor() {
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    /**
     * Returns the latest price
     */
    function getThePrice() external view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        if (price > 0) {
            return uint(price);
        } else {
            return 0;
        }
    }
}
