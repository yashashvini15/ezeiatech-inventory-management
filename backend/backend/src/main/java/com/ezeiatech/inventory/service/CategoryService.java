package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.CategoryRequest;
import com.ezeiatech.inventory.dto.CategoryResponse;
import com.ezeiatech.inventory.entity.Category;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse create(CategoryRequest request){
        String name = request.getName().trim();

        if(categoryRepository.existsByNameIgnoreCase(name)){
            throw new ApiException(HttpStatus.CONFLICT,"Category already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(request.getDescription());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll(){
        return categoryRepository.findAll().stream().map(CategoryResponse:: from).toList();
    }
}
