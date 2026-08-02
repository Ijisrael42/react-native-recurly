import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import React, { createContext, useContext, useState } from "react";

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType>({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: () => {},
});

export const SubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (newSub: Subscription) => {
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => useContext(SubscriptionsContext);
