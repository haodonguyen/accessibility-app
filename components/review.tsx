  //inspired by steam's rating system
  export const reviewClassification = (percentage: number): string => {
    if (percentage === 0) {
      return "No Reviews";
    } else if (percentage <= 19) {
      return "Negative";
    } else if (percentage <= 39) {
      return "Mostly Negative";
    } else if (percentage <= 69) {
      return "Mixed";
    } else if (percentage <= 79) {
      return "Mostly Positive";
    } else if (percentage <= 100) {
      return "Positive";
    }
  };


export const reviewPercentage = (reviews: any[]) => {
    if (reviews.length === 0) return 0;
    const recommendedCount = reviews.filter((review) => review.recommended === true).length;
    const notRecommendedCount = reviews.filter((review) => review.recommended === false).length;
    return Math.round((recommendedCount / (recommendedCount + notRecommendedCount)) * 100);
};