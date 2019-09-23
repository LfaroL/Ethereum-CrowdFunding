pragma solidity ^0.5.0;

import "./Utils.sol";
contract CrowdFunding {

	using Utils for *;

	// Campaign states
	enum State { Ongoing, Failed, Succeeded, Paidout }

	// Event to emit for when campaign is finished
	event CampaignFinished(
		address addr,
		uint totalCollected,
		bool succeeded	
	);

	string public name;
	uint public targetAmount;
	uint public fundingDeadline;
	address payable public beneficiary;
	State public state;
	mapping(address => uint) public amounts;
	bool public targetReached;
	uint public totalCollected;

	// Modifier that requires a function to be in a specific state
	modifier inState(State expectedState) {
		require(state == expectedState, "Invalid state");
		_;
	}

	constructor(
		string memory contractName,
		uint targetAmountEth,
		uint durationInMin,
		address payable beneficiaryAddress
		) 
	public 
	{
		name = contractName;
		targetAmount = Utils.etherToWei(targetAmountEth);
		fundingDeadline = currentTime() + Utils.minutesToSeconds(durationInMin);
		beneficiary = beneficiaryAddress;
		state = State.Ongoing;
	}

	// inState requires the campaign to be ongoing to contribute
	function contribute() public payable inState(State.Ongoing) {
		// requires the date to be before the deadline
		require(beforeDeadline(), "No contributions after the deadline");
		// Using the mapping to indicate how much each account has added
		amounts[msg.sender] += msg.value;
		// Add to total collected amount
		totalCollected += msg.value;

		// Specify that the target amount is reached
		if (totalCollected >= targetAmount) {
			targetReached = true;
		}
	}

	// inState requires the campaign to succeed for beneficiary to collect
	function collect() public inState(State.Succeeded) {
		// Use send method to send ether, if fails set state to Failed
		if (beneficiary.send(totalCollected)) {
			state = State.Paidout;
		} else {
			state = State.Failed;
		}
	}

	// inState requires the campaign to have failed for accounts to withdraw
	function withdraw() public inState(State.Failed) {
		// requires the account to have contributed something
		require(amounts[msg.sender] > 0, "Nothing was contributed");
		uint contributed = amounts[msg.sender];
		amounts[msg.sender] = 0;

		// Use send method to send back ether, if fails then set amount to equal the original contributed value again
		if (!msg.sender.send(contributed)) {
			amounts[msg.sender] = contributed;
		}
	}

	function finishCrowdFunding() public inState(State.Ongoing) {
		// requires the campaign to be after the deadline to finish it
		require(!beforeDeadline(), "Cannot finish campaign before a deadline");

		// if target reached, set to succeed, else campaign has failed
		if (!targetReached) {
			state = State.Failed;
		} else {
			state = State.Succeeded;
		}

		// emit an event with the specified arguments
		emit CampaignFinished(address(this), totalCollected, targetReached);
	}

	function beforeDeadline() public view returns(bool) {
		return currentTime() < fundingDeadline;
	}

	function currentTime() internal view returns(uint) {
		return now;
	}


}