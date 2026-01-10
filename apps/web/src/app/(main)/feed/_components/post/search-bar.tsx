export default function Search() {
    return (
        <form className="w-150">
            <input
                autoComplete="off"
                type="text"
                placeholder="Search by Swapparel"
                className="mt-5 w-full max-w-xl rounded-full border border-foreground bg-secondary-foreground p-3 text-gray-700 placeholder-gray-400 transition duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
        </form>
    );
}
