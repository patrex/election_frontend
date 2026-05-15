import axios_api from "./axios";

//refactor this function so that it only decides whether or not user is in already a voter
// all side effects to be handled in the component that uses the function
// this via return values from this function

export default async function checkReggedVoter (voter) {
    let flag = false;

    try {
        const voterList = await axios_api.get(`election/${election._id}/voterlist`);
        const listOfVoters = voterList.data;

        const existingVoters = election.userAuthType === 'phone'
            ? listOfVoters.map(v => v.phoneNo)
            : listOfVoters.map(v => v.email);

        // Existing voter - redirect to ballot
        if (existingVoters.includes(voter)) flag = true;

        // New/Unadded voter in closed election - reject
        if (election.type === 'Closed') {
            Toast.warning(
                `This is a closed election. Your ${election.userAuthType === 'email' ? 'email' : 'phone number'} 
					must be pre-registered by the election administrator.`
            );
            return;
        }

        return flag
    } catch (error) {
        console.error('Error checking voter:', error);
    } finally {

    }
}