const AvailableChatsSkeleton = () => {
  return (
    <article className="w-full flex flex-col justify-center gap-2 px-2">
      {Array(5)
        .fill(Object.keys)
        .map((_, index) => (
          <div key={index} className="loader-el w-full h-20 rounded-lg"></div>
        ))}
    </article>
  );
};

export default AvailableChatsSkeleton;
