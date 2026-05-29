export default addVoterToDb = async ({ _id, participant }) => {
    try {
        await axios_api.post(`election/${_id}/addvoter/participant`, {
            participant: participant,
            electionId: _id
        });

    } catch (error) {
       throw new Error('Failed to register voter');
    }
}