import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

export function SearchAndFilter({ 
  searchQuery, 
  setSearchQuery, 
  filter, 
  setFilter 
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="unanswered">Unanswered</SelectItem>
          <SelectItem value="most-voted">Most Viewed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}