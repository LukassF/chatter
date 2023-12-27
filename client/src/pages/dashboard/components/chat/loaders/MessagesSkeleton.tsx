const MessagesSkeleton = () => {
  return (
    <article className="w-full flex flex-col justify-center gap-2 px-2">
      {Array(10)
        .fill(Object.keys)
        .map((_, index) => (
          <div
            key={index}
            style={{
              alignSelf: [0, 1, 3, 4, 5, 9].includes(index)
                ? "flex-end"
                : "flex-start",
              height: [1, 4].includes(index) ? "100px" : "30px",
            }}
            className="loader-el w-1/3 rounded-lg"
          ></div>
        ))}
    </article>
  );
};

export default MessagesSkeleton;
