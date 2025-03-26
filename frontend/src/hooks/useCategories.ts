import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category, CreateCategoryDto, UpdateCategoryDto } from '../services/categoryService';

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            console.log('DEBUG - Fetching categories');
            const categories = await categoryService.getAll();
            console.log('DEBUG - Got categories:', categories);
            return categories;
        },
        staleTime: 60000, // 1 minute
    });
};

export const useCategory = (id: number) => {
    return useQuery({
        queryKey: ['category', id],
        queryFn: () => categoryService.getById(id),
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryDto) => categoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
            categoryService.update(id, data),
        onSuccess: (updatedCategory) => {
            queryClient.invalidateQueries({ queryKey: ['category', updatedCategory.id] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => categoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
}; 