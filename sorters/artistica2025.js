module.exports = function () {
    return function (scores) {
        const castedScores = scores.map((score) => parseInt(score || 0, 10));
        
        const interviewScore = castedScores[0] || 0;
        const presentation1 = castedScores[1] || 0;
        const presentation2 = castedScores[2] || 0;

        const bestPresentation = Math.max(presentation1, presentation2);
        const total = interviewScore + bestPresentation;

        return [total, interviewScore, bestPresentation, presentation1, presentation2];
    };
};