export function ActivityLegend() {
    return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-[#ebedf0]" />
                <div className="w-3 h-3 rounded-sm bg-[#9be9a8]" />
                <div className="w-3 h-3 rounded-sm bg-[#40c463]" />
                <div className="w-3 h-3 rounded-sm bg-[#30a14e]" />
                <div className="w-3 h-3 rounded-sm bg-[#216e39]" />
            </div>
            <span>More</span>
        </div>
    );
}
