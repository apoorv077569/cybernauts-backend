import { User } from "../models/user.model.js";

const calculatePopularityScore = async (userDoc) => {
    const numUniqueFriends = userDoc.friends.length;
    let totalSharedHobbies = 0;

    const friendsId = userDoc.friends.map(id=>id);
    const friends = await User.find({_id:{$in:friendsId}}).select('hobbies');
    const userHobbiesSet = new Set(userDoc.hobbies.map(h=>h.toLowerCase().trim()));

    for(const friend of friends){
        if(!friend.hobbies) continue;

        const sharedCount = friend.hobbies.reduce((count,hobby)=>{
            if(userHobbiesSet.has(hobby.toLowerCase().trim())){
                return count + 1;
            }
            return count;
        },0);
        totalSharedHobbies += sharedCount;
    }
    const popularityScore = numUniqueFriends + (totalSharedHobbies * 0.5);
    userDoc.popularityScore = popularityScore;
    return popularityScore;
};

export default calculatePopularityScore;
