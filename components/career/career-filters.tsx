'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EmploymentType, JobFilters } from '@/lib/career-api'
import { formatEmploymentType } from '@/lib/career-format'

const ALL = '__all__'

export function CareerFilters({
  filters,
  initial,
}: {
  filters: JobFilters
  initial: {
    search?: string
    department?: string
    location?: string
    employmentType?: string
    experienceMin?: string
    experienceMax?: string
  }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initial.search ?? '')
  const [department, setDepartment] = useState(initial.department ?? ALL)
  const [location, setLocation] = useState(initial.location ?? ALL)
  const [employmentType, setEmploymentType] = useState(initial.employmentType ?? ALL)
  const [experienceMin, setExperienceMin] = useState(initial.experienceMin ?? '')
  const [experienceMax, setExperienceMax] = useState(initial.experienceMax ?? '')

  const applyFilters = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    const set = (key: string, value: string) => {
      if (value && value !== ALL) params.set(key, value)
      else params.delete(key)
    }

    set('search', search.trim())
    set('department', department)
    set('location', location)
    set('employmentType', employmentType)
    set('experienceMin', experienceMin)
    set('experienceMax', experienceMax)
    params.delete('page')

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setDepartment(ALL)
    setLocation(ALL)
    setEmploymentType(ALL)
    setExperienceMin('')
    setExperienceMax('')
    router.push(pathname)
  }

  return (
    <form
      onSubmit={applyFilters}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 items-end border border-[#2a3344] bg-[#0a1019] p-6 mb-12"
    >
      <div className="lg:col-span-2 flex flex-col gap-2">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase">
          Search
        </label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, department, skills..."
          className="bg-transparent border-[#2a3344] text-[#F2EFE6] placeholder:text-[#6A6E78]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase">
          Department
        </label>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full bg-transparent border-[#2a3344] text-[#F2EFE6]">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All departments</SelectItem>
            {filters.departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase">
          Location
        </label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full bg-transparent border-[#2a3344] text-[#F2EFE6]">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All locations</SelectItem>
            {filters.locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase">
          Employment Type
        </label>
        <Select value={employmentType} onValueChange={setEmploymentType}>
          <SelectTrigger className="w-full bg-transparent border-[#2a3344] text-[#F2EFE6]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {filters.employmentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {formatEmploymentType(type as EmploymentType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase">
          Experience (yrs)
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            value={experienceMin}
            onChange={(e) => setExperienceMin(e.target.value)}
            placeholder="Min"
            className="bg-transparent border-[#2a3344] text-[#F2EFE6] placeholder:text-[#6A6E78]"
          />
          <Input
            type="number"
            min={0}
            value={experienceMax}
            onChange={(e) => setExperienceMax(e.target.value)}
            placeholder="Max"
            className="bg-transparent border-[#2a3344] text-[#F2EFE6] placeholder:text-[#6A6E78]"
          />
        </div>
      </div>

      <div className="lg:col-span-6 flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          className="border-[#2a3344] text-[#D5D6D8] hover:bg-[#1a2233] hover:text-[#F2EFE6] font-mono text-xs tracking-widest uppercase"
        >
          Clear
        </Button>
        <Button
          type="submit"
          className="bg-[#F2EFE6] text-[#050912] hover:bg-[#D5D6D8] font-medium tracking-widest uppercase text-xs"
        >
          Apply Filters
        </Button>
      </div>
    </form>
  )
}
