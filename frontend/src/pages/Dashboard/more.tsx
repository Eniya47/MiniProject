import cogoToast from "cogo-toast";
import React, { Suspense } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components";
import { UILoader } from "../../components/loaders";
import { instance } from "../../config";
import useSWR from "swr";

export const More = () => {
  const params = useParams().id;
  const fetcher = (url: string) => instance.get(url).then((res) => res.data);
  const { data, error } = useSWR("/recipe/" + params, fetcher, {
    suspense: true,
  });

  // Handle fetch error
  if (error) {
    console.log("Fetch error:", error);
    cogoToast.error(error?.response?.data?.error || "Failed to load recipe");
    return null;
  }

  // Ensure data exists (though suspense should guarantee this)
  if (!data) {
    console.log("No data returned");
    cogoToast.error("No recipe data available");
    return null;
  }

  return (
    <Suspense fallback={<UILoader />}>
      <div className="flex items-center justify-center m-auto flex-col w-full">
        <div className="w-full bg-zinc-900 p-4">
          {/* Card component with a fallback for ingredients */}
          <Card
            isFull={true}
            id={data._id}
            title={data.title}
            image={data.image?.url}
            ingredients={
              Array.isArray(data.ingredients) ? data.ingredients.join(", ") : ""
            }
            note={data.note}
            description={data.description}
            email={data.user?.email}
            avatar="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
          />
          {/* Additional details section with larger fonts */}
          <div className="mt-4">
            <h3 className="text-orange-500 font-bold text-2xl mb-2">
              Additional Details
            </h3>
            <p className="text-orange-500 font-light text-lg">
              Prep Time: <span className="text-white">{data.prepTime}</span>
            </p>
            <p className="text-orange-500 font-light text-lg">
              Cook Time: <span className="text-white">{data.cookTime}</span>
            </p>
            <p className="text-orange-500 font-light text-lg">
              Servings: <span className="text-white">{data.servings}</span>
            </p>
            <p className="text-orange-500 font-light text-lg mt-2">
              Instructions:
            </p>
            <ol className="text-white list-decimal list-inside text-lg">
              {Array.isArray(data.instructions) &&
                data.instructions.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
            </ol>
          </div>
        </div>
      </div>
    </Suspense>
  );
};
