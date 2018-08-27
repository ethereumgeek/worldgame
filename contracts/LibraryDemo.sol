pragma solidity ^0.4.0;
import "openzeppelin-solidity/contracts/math/Math.sol";

/** @title Library demo using Math from openzeppelin. */
contract LibraryDemo {

    /* Current value. */
    uint256 public currentVal;

    /* Event indicating current value got bigger. */
    event Bigger(uint256 value);

    /* Event indicating current value got smaller. */
    event Smaller(uint256 value);

    /* Constructor. */
    constructor() public {
    }

    /* Fallback function. Added so ether sent to this contract is reverted. */
    function() public payable {
        revert("Invalid call to contract.");
    }

    /// @notice Updates stored value to maximum betweem current and new value 
    /// @param newVal New value to use in maximum
    function maximum(uint256 newVal) public {
        currentVal = Math.max(currentVal, newVal);
        emit Bigger(currentVal);
    }

    /// @notice Updates stored value to minimum betweem current and new value 
    /// @param newVal New value to use in minimum
    function minimum(uint256 newVal) public {
        currentVal = Math.min(currentVal, newVal);
        emit Smaller(currentVal);
    }
}
